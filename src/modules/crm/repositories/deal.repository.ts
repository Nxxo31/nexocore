// NexoCore — Deal Repository (Tenant-isolated)
// CRM deals with cursor-based pagination, stage filtering, and pipeline board queries

import { prisma } from "@/shared/database/prisma";
import {
  PaginatedResult,
  PaginationParams,
  TenantRepository,
} from "@/shared/database/base.repository";
import type { Deal, Prisma } from "@prisma/client";

export interface DealByStageResult {
  stage: string;
  deals: (Deal & { contact: { id: string; name: string; email: string | null; company: string | null } })[];
}

export class DealRepository extends TenantRepository<Deal> {
  protected get model(): string {
    return "deal";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<Deal>> {
    const { cursor, take = 20, skip = 0 } = pagination;

    const where: Prisma.DealWhereInput = {
      tenantId: this.tenantId,
      ...filters,
    };

    const [data, total] = await prisma.$transaction([
      prisma.deal.findMany({
        where,
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          contact: { select: { id: true, name: true, email: true, company: true } },
        },
      }),
      prisma.deal.count({ where }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<Deal | null> {
    return prisma.deal.findFirst({
      where: { id, tenantId: this.tenantId },
      include: { contact: true, activities: true },
    });
  }

  async create(data: Record<string, unknown>): Promise<Deal> {
    return prisma.deal.create({
      data: { ...data, tenantId: this.tenantId } as unknown as Prisma.DealCreateInput,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<Deal> {
    return prisma.deal.update({
      where: { id, tenantId: this.tenantId },
      data: data as unknown as Prisma.DealUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.deal.delete({ where: { id, tenantId: this.tenantId } });
  }

  /**
   * Moves a deal to a new stage and sets closed timestamps if applicable.
   * Used by the drag-and-drop pipeline board.
   */
  async moveStage(
    dealId: string,
    newStage: string,
    stageMeta?: { isWon: boolean; isLost: boolean; isClosed: boolean }
  ): Promise<Deal> {
    const now = new Date();
    const updateData: Prisma.DealUpdateInput = { stage: newStage };

    if (stageMeta?.isWon) {
      updateData.wonAt = now;
      updateData.closedAt = now;
      updateData.probability = 100;
    } else if (stageMeta?.isLost) {
      updateData.lostAt = now;
      updateData.closedAt = now;
      updateData.probability = 0;
    } else if (stageMeta?.isClosed) {
      updateData.closedAt = now;
    }

    return prisma.deal.update({
      where: { id: dealId, tenantId: this.tenantId },
      data: updateData,
      include: {
        contact: { select: { id: true, name: true, email: true, company: true } },
      },
    });
  }

  /**
   * Returns all deals grouped by stage for the pipeline board.
   * Deals include their related contact for display.
   */
  async findByStages(): Promise<DealByStageResult[]> {
    const deals = await prisma.deal.findMany({
      where: { tenantId: this.tenantId },
      orderBy: { createdAt: "desc" },
      include: {
        contact: { select: { id: true, name: true, email: true, company: true } },
      },
    });

    const grouped: Record<string, DealByStageResult["deals"]> = {};
    for (const deal of deals) {
      if (!grouped[deal.stage]) grouped[deal.stage] = [];
      grouped[deal.stage].push(deal);
    }

    return Object.entries(grouped).map(([stage, stageDeals]) => ({
      stage,
      deals: stageDeals,
    }));
  }

  /**
   * Summary metrics for the pipeline header.
   */
  async getPipelineSummary(): Promise<{
    totalDeals: number;
    totalValue: number;
    wonValue: number;
    activeDeals: number;
  }> {
    const deals = await prisma.deal.findMany({
      where: { tenantId: this.tenantId },
      select: { value: true, stage: true, wonAt: true, lostAt: true },
    });

    const totalValue = deals.reduce((sum, d) => sum + Number(d.value), 0);
    const wonValue = deals
      .filter((d) => d.wonAt !== null)
      .reduce((sum, d) => sum + Number(d.value), 0);
    const activeDeals = deals.filter((d) => d.wonAt === null && d.lostAt === null).length;

    return {
      totalDeals: deals.length,
      totalValue,
      wonValue,
      activeDeals,
    };
  }
}
