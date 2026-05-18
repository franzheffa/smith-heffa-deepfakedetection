import { Prisma } from "@prisma/client";
import { getPrismaClient } from "@/lib/prisma";

type AuditStatus = "SUCCESS" | "FAILURE" | "PENDING";
type AuditActorType = "USER" | "SYSTEM" | "SERVICE";

export type RecordAuditEventInput = {
  action: string;
  actorId?: string;
  actorType?: AuditActorType;
  subjectId?: string;
  subjectType?: string;
  status?: AuditStatus;
  requestId?: string;
  sourceIp?: string;
  userAgent?: string;
  details?: Prisma.InputJsonValue;
};

export async function recordAuditEvent(input: RecordAuditEventInput) {
  const prisma = getPrismaClient();

  return prisma.auditEvent.create({
    data: {
      action: input.action,
      actorId: input.actorId,
      actorType: input.actorType ?? "SYSTEM",
      subjectId: input.subjectId,
      subjectType: input.subjectType,
      status: input.status ?? "SUCCESS",
      requestId: input.requestId,
      sourceIp: input.sourceIp,
      userAgent: input.userAgent,
      details: input.details ?? Prisma.JsonNull,
    },
  });
}
