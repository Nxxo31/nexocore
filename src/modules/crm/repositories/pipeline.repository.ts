// NexoCore — PipelineStage Repository (Tenant-isolated)
// Manages pipeline stages (columns) for the visual kanban board

import { prisma } from "@/shared/database/prisma";
import {
  PaginatedResult,
  PaginationParams,
  TenantRepository,
} from "@/shared/database/base.repository";
import type { PipelineStage, Prisma } from "@prisma/client";

export class PipelineStageRepository extends TenantRepository<PipelineStage> {
  protected get model(): string {
    return "pipelineStage";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<PipelineStage>> {
    const { cursor, take = 50, skip = 0 } = pagination;

    const where: Prisma.PipelineStageWhereInput = {
      tenantId: this.tenantId,
      ...filters,
    };

    const [data, total] = await prisma.$transaction([
      prisma.pipelineStage.findMany({
        where,
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { position: "asc" },
      }),
      prisma.pipelineStage.count({ where }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<PipelineStage | null> {
    return prisma.pipelineStage.findFirst({
      where: { id, tenantId: this.tenantId },
    });
  }

  async create(data: Record<string, unknown>): Promise<PipelineStage> {
    return prisma.pipelineStage.create({
      data: { ...data, tenantId: this.tenantId } as unknown as Prisma.PipelineStageCreateInput,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<PipelineStage> {
    return prisma.pipelineStage.update({
      where: { id },
      data: data as unknown as Prisma.PipelineStageUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.pipelineStage.delete({ where: { id, tenantId: this.tenantId } });
  }

  /**
   * Returns stages ordered by position (pipeline columns).
   */
  async findOrdered(): Promise<PipelineStage[]> {
    return prisma.pipelineStage.findMany({
      where: { tenantId: this.tenantId },
      orderBy: { position: "asc" },
    });
  }

  /**
   * Bulk reorder stages after a drag operation.
   * Receives the new ordering of ids and updates positions.
   */
  async reorder(stageIds: string[]): Promise<void> {
    await prisma.$transaction(
      stageIds.map((id, index) =>
        prisma.pipelineStage.update({
          where: { id, tenantId: this.tenantId },
          data: { position: index },
        })
      )
    );
  }

  /**
   * Finds a stage by its name within the tenant.
   */
  async findByName(name: string): Promise<PipelineStage | null> {
    return prisma.pipelineStage.findFirst({
      where: { name, tenantId: this.tenantId },
    });
  }
}
