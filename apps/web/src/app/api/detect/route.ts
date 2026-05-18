import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { detectionApiUrl } from "@/lib/config";
import { getPrismaClient } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DetectionEnvelope = {
  statusCode?: number;
  body?: unknown;
};

type DetectionPayload = {
  error?: string;
  message?: string;
  detail?: string;
  detection_result?: {
    data?: Array<{
      bounding_boxes: Array<{
        is_deepfake: number;
        bbox_confidence: number;
      }>;
    }>;
    status?: number;
    title?: string;
    detail?: string;
    meta?: {
      provider?: string;
      faces_screened?: number;
      rationale?: string;
    };
  };
};

function normalizeSecretValue(value?: string) {
  return value?.replace(/^"+|"+$/g, "").replace(/\\n/g, "").trim();
}

function clampScore(value: number) {
  if (Number.isNaN(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function stripCodeFence(text: string) {
  return text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/, "").trim();
}

async function runVisionFallback(base64Image: string): Promise<DetectionPayload> {
  const apiKey = normalizeSecretValue(process.env.OPENAI_API_KEY);

  if (!apiKey) {
    throw new Error("Vision fallback is not configured.");
  }

  const fallbackResponse = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text:
                "You are a deepfake image screening assistant. Analyze the image and return JSON only with the keys aiGeneratedProbability, authenticityScore, screeningConfidence, facesScreened, trustVerdict, and rationale. Use 0-100 numeric values for the score fields. Keep rationale under 35 words.",
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${base64Image}`,
              detail: "low",
            },
          ],
        },
      ],
      max_output_tokens: 220,
    }),
    cache: "no-store",
  });

  const fallbackJson = await fallbackResponse.json().catch(() => null);
  if (!fallbackResponse.ok) {
    const message =
      fallbackJson?.error?.message
      || fallbackJson?.message
      || "Vision fallback request failed.";
    throw new Error(message);
  }

  const outputText =
    typeof fallbackJson?.output_text === "string"
      ? fallbackJson.output_text
      : typeof fallbackJson?.output?.[0]?.content?.[0]?.text === "string"
        ? fallbackJson.output[0].content[0].text
        : "";

  if (!outputText) {
    throw new Error("Vision fallback returned no readable output.");
  }

  const parsed = JSON.parse(stripCodeFence(outputText)) as {
    aiGeneratedProbability?: number;
    authenticityScore?: number;
    screeningConfidence?: number;
    facesScreened?: number;
    trustVerdict?: string;
    rationale?: string;
  };

  const aiProbability = clampScore((parsed.aiGeneratedProbability ?? 0) / 100);
  const confidence = clampScore((parsed.screeningConfidence ?? 0) / 100);

  return {
    message: "Analysis complete",
    detection_result: {
      data: [
        {
          bounding_boxes: [
            {
              is_deepfake: aiProbability,
              bbox_confidence: confidence,
            },
          ],
        },
      ],
      meta: {
        provider: "openai-vision-fallback",
        faces_screened: parsed.facesScreened ?? 1,
        rationale: parsed.rationale ?? "",
      },
    },
  };
}

function normalizeDetectionResponse(result: unknown) {
  if (!result || typeof result !== "object") {
    return {
      data: null,
      envelopeStatusCode: null,
      nestedStatusCode: null,
      error: null as string | null,
    };
  }

  const envelope = result as DetectionEnvelope;
  const body =
    typeof envelope.body === "string"
      ? JSON.parse(envelope.body)
      : envelope.body && typeof envelope.body === "object"
        ? envelope.body
        : result;

  const payload = (body && typeof body === "object" ? body : result) as DetectionPayload;
  const nestedStatus =
    payload.detection_result && typeof payload.detection_result.status === "number"
      ? payload.detection_result.status
      : null;

  return {
    data: payload,
    envelopeStatusCode: typeof envelope.statusCode === "number" ? envelope.statusCode : null,
    nestedStatusCode: nestedStatus,
    error:
      payload.error
      || payload.detail
      || payload.detection_result?.detail
      || payload.detection_result?.title
      || null,
  };
}

function shouldUseVisionFallback(
  response: Response,
  normalized: ReturnType<typeof normalizeDetectionResponse>
) {
  const envelopeFailure =
    normalized.envelopeStatusCode !== null && normalized.envelopeStatusCode >= 400;
  const nestedFailure =
    normalized.nestedStatusCode !== null && normalized.nestedStatusCode >= 400;
  const payloadFailure =
    Boolean(normalized.data?.error)
    || Boolean(normalized.data?.detail)
    || Boolean(normalized.data?.detection_result?.detail);
  const missingBoxes =
    !normalized.data?.detection_result?.data?.[0]?.bounding_boxes?.length;

  return (
    !response.ok
    || envelopeFailure
    || nestedFailure
    || (payloadFailure && missingBoxes)
  );
}

export async function POST(request: NextRequest) {
  const session = await auth();
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload.image !== "string" || !payload.image.trim()) {
    return NextResponse.json({ error: "Expected a base64 image payload." }, { status: 400 });
  }

  const prisma = getPrismaClient();
  const detection = await prisma.detectionJob.create({
    data: {
      userId: session?.user?.id,
      assetType: "IMAGE",
      provider: "aws-nvidia",
      status: "PENDING",
      requestBody: { hasImage: true },
    },
  }).catch(() => null);

  try {
    const response = await fetch(`${detectionApiUrl.replace(/\/$/, "")}/upload`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        image: payload.image,
      }),
      cache: "no-store",
    });

    const result = await response.json().catch(() => null);
    const normalized = normalizeDetectionResponse(result);

    let finalPayload: DetectionPayload = normalized.data ?? {};
    let provider = "aws-nvidia";

    if (shouldUseVisionFallback(response, normalized)) {
      console.warn("[api/detect] upstream detection unavailable, switching to fallback", {
        responseOk: response.ok,
        envelopeStatusCode: normalized.envelopeStatusCode,
        nestedStatusCode: normalized.nestedStatusCode,
        error: normalized.error,
      });
      finalPayload = await runVisionFallback(payload.image);
      provider = "openai-vision-fallback";
    }

    if (detection) {
      await prisma.detectionJob.update({
        where: { id: detection.id },
        data: {
          status: "SUCCESS",
          responseBody: finalPayload,
        },
      }).catch(() => undefined);
    }

    await recordAuditEvent({
      action: "detection.image.success",
      actorId: session?.user?.id,
      actorType: session?.user?.id ? "USER" : "SYSTEM",
      subjectId: detection?.id,
      subjectType: "detection_job",
      status: "SUCCESS",
      details: { provider },
    }).catch(() => undefined);

    return NextResponse.json(finalPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Detection request failed.";

    if (detection) {
      await prisma.detectionJob.update({
        where: { id: detection.id },
        data: {
          status: "FAILURE",
          responseBody: { error: message },
        },
      }).catch(() => undefined);
    }

    await recordAuditEvent({
      action: "detection.image.failure",
      actorId: session?.user?.id,
      actorType: session?.user?.id ? "USER" : "SYSTEM",
      subjectId: detection?.id,
      subjectType: "detection_job",
      status: "FAILURE",
      details: { error: message },
    }).catch(() => undefined);

    return NextResponse.json({ error: message }, { status: 502 });
  }
}
