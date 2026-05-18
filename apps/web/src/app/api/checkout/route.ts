import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getPrismaClient } from "@/lib/prisma";
import { paygateUrl } from "@/lib/config";
import { recordAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const planPricing: Record<string, number> = {
  starter: 2900,
  growth: 14900,
  enterprise: 0,
};

export async function POST(request: NextRequest) {
  const session = await auth();
  const payload = await request.json().catch(() => null);
  const plan = typeof payload?.plan === "string" ? payload.plan : "starter";
  const checkoutUrl = `${paygateUrl}?plan=${encodeURIComponent(plan)}&source=smith-heffa-enterprise-web`;
  const prisma = getPrismaClient();

  const checkout = await prisma.checkoutSession.create({
    data: {
      userId: session?.user?.id,
      planCode: plan,
      amountCents: planPricing[plan] ?? 0,
      checkoutUrl,
      status: "REDIRECTED",
      metadata: {
        source: "smith-heffa-enterprise-web",
      },
    },
  }).catch(() => null);

  await recordAuditEvent({
    action: "billing.checkout.redirect",
    actorId: session?.user?.id,
    actorType: session?.user?.id ? "USER" : "SYSTEM",
    subjectId: checkout?.id,
    subjectType: "checkout_session",
    status: "SUCCESS",
    details: { plan },
  }).catch(() => undefined);

  return NextResponse.json({
    ok: true,
    url: checkoutUrl,
  });
}
