import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { detectionApiUrl } from "@/lib/config";
import { getPrismaClient } from "@/lib/prisma";
import { recordAuditEvent } from "@/lib/audit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    if (!response.ok) {
      throw new Error((result && (result.error || result.message)) || "Detection request failed.");
    }

    if (detection) {
      await prisma.detectionJob.update({
        where: { id: detection.id },
        data: {
          status: "SUCCESS",
          responseBody: result,
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
    }).catch(() => undefined);

    return NextResponse.json(result);
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
