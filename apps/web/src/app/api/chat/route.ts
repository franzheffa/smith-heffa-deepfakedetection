import { NextRequest } from "next/server";
import { convertToModelMessages, stepCountIs, streamText, tool, UIMessage } from "ai";
import { z } from "zod";
import { auth } from "@/auth";
import { getModelForProvider, type ProviderKey } from "@/lib/models";
import { recordAuditEvent } from "@/lib/audit";
import { detectionApiUrl, paygateUrl } from "@/lib/config";
import { getPrismaClient } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const providerSchema = z.enum(["openai", "anthropic", "gemini"]);

export async function POST(request: NextRequest) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const provider = providerSchema.catch("anthropic").parse(searchParams.get("provider") || "anthropic") as ProviderKey;
  const body = await request.json();
  const messages = (body.messages ?? []) as UIMessage[];
  const prisma = getPrismaClient();

  const conversation = await prisma.agentConversation.create({
    data: {
      userId: session?.user?.id,
      provider,
      lastPrompt: null,
    },
  }).catch(() => null);

  await recordAuditEvent({
    action: "agent.chat.request",
    actorId: session?.user?.id,
    actorType: session?.user?.id ? "USER" : "SYSTEM",
    subjectId: conversation?.id,
    subjectType: "agent_conversation",
    status: "PENDING",
    details: { provider },
  }).catch(() => undefined);

  const result = streamText({
    model: getModelForProvider(provider),
    messages: await convertToModelMessages(messages),
    stopWhen: stepCountIs(4),
    system:
      "You are the Smith-Heffa enterprise AI agent. Help users with deepfake detection operations, pricing, platform readiness, risk review, and go-to-market workflows. Be precise, practical, and enterprise-safe.",
    tools: {
      pricing_catalog: tool({
        description: "Return the available pricing plans for the detection platform.",
        inputSchema: z.object({}),
        execute: async () => ({
          plans: [
            { code: "starter", price: "$29", description: "50 image detections per month" },
            { code: "growth", price: "$149", description: "500 image detections and audit exports" },
            { code: "enterprise", price: "Custom", description: "SAML, dedicated support, and video roadmap access" },
          ],
        }),
      }),
      detection_status: tool({
        description: "Return the current detection API endpoint and health hint.",
        inputSchema: z.object({}),
        execute: async () => ({
          endpoint: detectionApiUrl,
          status: "configured",
        }),
      }),
      build_checkout_link: tool({
        description: "Generate a checkout link for a pricing plan.",
        inputSchema: z.object({
          plan: z.string(),
        }),
        execute: async ({ plan }) => ({
          url: `${paygateUrl}?plan=${encodeURIComponent(plan)}&source=smith-heffa-enterprise-web`,
        }),
      }),
    },
    onFinish: async () => {
      await recordAuditEvent({
        action: "agent.chat.response",
        actorId: session?.user?.id,
        actorType: session?.user?.id ? "USER" : "SYSTEM",
        subjectId: conversation?.id,
        subjectType: "agent_conversation",
        status: "SUCCESS",
        details: { provider },
      }).catch(() => undefined);
    },
  });

  return result.toUIMessageStreamResponse();
}
