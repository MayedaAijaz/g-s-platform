import { db } from "../db/client.js";

interface AuditParams {
  userId?: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId: string;
  previousState?: unknown;
  newState?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId ?? null,
        userEmail: params.userEmail ?? null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        previousState: params.previousState
          ? (params.previousState as object)
          : undefined,
        newState: params.newState ? (params.newState as object) : undefined,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (err) {
    // Audit log failures must never break the main operation
    console.error("[AuditLog] Failed to write audit entry:", err);
  }
}
