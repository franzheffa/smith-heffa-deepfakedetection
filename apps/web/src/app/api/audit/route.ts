import { NextRequest, NextResponse } from "next/server";
import { recordAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    service: "smith-heffa-enterprise-web-audit",
    status: "ready",
    method: "POST",
    contract: {
      action: "string",
      actorId: "string?",
      actorType: "USER | SYSTEM | SERVICE",
      subjectId: "string?",
      subjectType: "string?",
      status: "SUCCESS | FAILURE | PENDING",
      details: "json?",
    },
  });
}

export async function POST(request: NextRequest) {
  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload.action !== "string" || !payload.action.trim()) {
    return NextResponse.json(
      {
        error: "Invalid audit payload. Expected a non-empty 'action' field.",
      },
      { status: 400 },
    );
  }

  try {
    const event = await recordAuditEvent({
      action: payload.action,
      actorId: payload.actorId,
      actorType: payload.actorType,
      subjectId: payload.subjectId,
      subjectType: payload.subjectType,
      status: payload.status,
      details: payload.details,
      requestId: request.headers.get("x-request-id") ?? undefined,
      sourceIp:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
        || request.headers.get("x-real-ip")
        || undefined,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ ok: true, eventId: event.id }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown audit error";
    return NextResponse.json(
      {
        ok: false,
        error: message,
      },
      { status: 503 },
    );
  }
}
