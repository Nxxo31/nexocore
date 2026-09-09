// NexoCore — Activity Repository (Tenant-isolated)
// CRM activities (calls, emails, meetings, notes, tasks) linked to contacts/deals

import { prisma } from "@/shared/database/prisma";
import {
  PaginatedResult,
  PaginationParams,
  TenantRepository,
} from "@/shared/database/base.repository";
import type { Activity, Prisma } from "@prisma/client";

export class ActivityRepository extends TenantRepository<Activity> {
  protected get model(): string {
    return "activity";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<Activity>> {
    const { cursor, take = 20, skip = 0 } = pagination;

    const where: Prisma.ActivityWhereInput = {
      tenantId: this.tenantId,
      ...filters,
    };

    const [data, total] = await prisma.$transaction([
      prisma.activity.findMany({
        where,
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
      }),
      prisma.activity.count({ where }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<Activity | null> {
    return prisma.activity.findFirst({
      where: { id, tenantId: this.tenantId },
    });
  }

  async create(data: Record<string, unknown>): Promise<Activity> {
    return prisma.activity.create({
      data: { ...data, tenantId: this.tenantId } as unknown as Prisma.ActivityCreateInput,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<Activity> {
    return prisma.activity.update({
      where: { id },
      data: data as unknown as Prisma.ActivityUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.activity.delete({ where: { id, tenantId: this.tenantId } });
  }

  /**
   * Returns upcoming scheduled activities (not completed) for the tenant.
   */
  async findUpcoming(limit: number = 10): Promise<Activity[]> {
    return prisma.activity.findMany({
      where: {
        tenantId: this.tenantId,
        completedAt: null,
        scheduledAt: { gte: new Date() },
      },
      orderBy: { scheduledAt: "asc" },
      take: limit,
    });
  }

  /**
   * Marks an activity as completed.
   */
  async markCompleted(id: string): Promise<Activity> {
    return prisma.activity.update({
      where: { id, tenantId: this.tenantId },
      data: { completedAt: new Date() },
    });
  }
}
