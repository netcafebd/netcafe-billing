import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@prisma/client";

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export async function logAuditEvent(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        metadata: params.metadata || Prisma.JsonNull,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}

