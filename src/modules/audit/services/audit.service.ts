// NexoCore — Audit Service
// Logs tenant-scoped actions: { tenantId, userId, action, entity, entityId, metadata, timestamp }
// Designed to be called from API routes, server actions, and background jobs.

import { prisma } from "@/shared/database/prisma";
import type { AuditAction, Prisma } from "@prisma/client";

export interface AuditLogInput {
  tenantId: string;
  userId?: string;
  action: AuditAction;
  entity: string; // "Contact" | "Deal" | "Invoice" | etc.
  entityId?: string;
  metadata?: unknown;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Persists an audit log entry.
   * Non-blocking: swallows errors to never break the calling operation.
   * The audit log is a best-effort trail — a logging failure must not
   * cause a business operation to fail.
   */
  static async log(input: AuditLogInput): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          tenantId: input.tenantId,
          userId: input.userId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          metadata: input.metadata ?? {},
          ipAddress: input.ipAddress ?? null,
          userAgent: input.userAgent ?? null,
        },
      });
    } catch (error) {
      console.error("[AuditService] Failed to write audit log:", error);
    }
  }

  /**
   * Convenience helper for CREATE actions on a given entity.
   */
  static async logCreate(
    tenantId: string,
    userId: string | undefined,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log({ tenantId, userId, action: "CREATE", entity, entityId, metadata });
  }

  /**
   * Convenience helper for UPDATE actions.
   */
  static async logUpdate(
    tenantId: string,
    userId: string | undefined,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log({ tenantId, userId, action: "UPDATE", entity, entityId, metadata });
  }

  /**
   * Convenience helper for DELETE actions.
   */
  static async logDelete(
    tenantId: string,
    userId: string | undefined,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log({ tenantId, userId, action: "DELETE", entity, entityId, metadata });
  }

  /**
   * Convenience helper for MOVE actions (e.g., deal stage changes in the pipeline).
   */
  static async logMove(
    tenantId: string,
    userId: string | undefined,
    entity: string,
    entityId: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log({ tenantId, userId, action: "MOVE", entity, entityId, metadata });
  }

  /**
   * Convenience helper for EXPORT actions (CSV/Excel downloads).
   */
  static async logExport(
    tenantId: string,
    userId: string | undefined,
    entity: string,
    metadata?: Record<string, unknown>
  ): Promise<void> {
    await this.log({ tenantId, userId, action: "EXPORT", entity, metadata });
  }
}
