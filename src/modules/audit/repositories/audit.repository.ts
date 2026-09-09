// NexoCore — AuditLog Repository (Tenant-isolated)
// Persistent audit trail for all tenant-scoped actions

import { prisma } from "@/shared/database/prisma";
import {
  PaginatedResult,
  PaginationParams,
  TenantRepository,
} from "@/shared/database/base.repository";
import type { AuditLog, AuditAction, Prisma } from "@prisma/client";

export interface AuditLogFilter {
  action?: AuditAction;
  entity?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class AuditLogRepository extends TenantRepository<AuditLog> {
  protected get model(): string {
    return "auditLog";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<AuditLog>> {
    const { cursor, take = 50, skip = 0 } = pagination;

    const where: Prisma.AuditLogWhereInput = {
      tenantId: this.tenantId,
      ...(filters.action ? { action: filters.action as AuditAction } : {}),
      ...(filters.entity ? { entity: filters.entity as string } : {}),
      ...(filters.userId ? { userId: filters.userId as string } : {}),
      ...(filters.startDate || filters.endDate
        ? {
            createdAt: {
              ...(filters.startDate ? { gte: filters.startDate as Date } : {}),
              ...(filters.endDate ? { lte: filters.endDate as Date } : {}),
            },
          }
        : {}),
    };

    const [data, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      }),
      prisma.auditLog.count({ where }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<AuditLog | null> {
    return prisma.auditLog.findFirst({
      where: { id, tenantId: this.tenantId },
    });
  }

  async create(data: Record<string, unknown>): Promise<AuditLog> {
    return prisma.auditLog.create({
      data: {
        ...data,
        tenantId: this.tenantId,
      } as unknown as Prisma.AuditLogCreateInput,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<AuditLog> {
    return prisma.auditLog.update({
      where: { id },
      data: data as unknown as Prisma.AuditLogUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.auditLog.delete({ where: { id, tenantId: this.tenantId } });
  }
}
