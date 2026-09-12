// NexoCore — InventoryMovement Repository (Tenant-isolated)
// Tracks stock movements (entries, exits, adjustments, transfers) per product.

import { prisma } from "@/shared/database/prisma";
import {
  PaginatedResult,
  PaginationParams,
  TenantRepository,
} from "@/shared/database/base.repository";
import type { InventoryMovement, Prisma } from "@prisma/client";

export class InventoryMovementRepository extends TenantRepository<InventoryMovement> {
  protected get model(): string {
    return "inventoryMovement";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<InventoryMovement>> {
    const { cursor, take = 20, skip = 0 } = pagination;

    const where: Prisma.InventoryMovementWhereInput = {
      tenantId: this.tenantId,
      ...filters,
    };

    const [data, total] = await prisma.$transaction([
      prisma.inventoryMovement.findMany({
        where,
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: "desc" },
        include: { product: { select: { id: true, name: true, sku: true } } },
      }),
      prisma.inventoryMovement.count({ where }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<InventoryMovement | null> {
    return prisma.inventoryMovement.findFirst({
      where: { id, tenantId: this.tenantId },
      include: { product: true },
    });
  }

  async create(data: Record<string, unknown>): Promise<InventoryMovement> {
    return prisma.inventoryMovement.create({
      data: { ...data, tenantId: this.tenantId } as unknown as Prisma.InventoryMovementCreateInput,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<InventoryMovement> {
    return prisma.inventoryMovement.update({
      where: { id, tenantId: this.tenantId },
      data: data as unknown as Prisma.InventoryMovementUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.inventoryMovement.delete({ where: { id, tenantId: this.tenantId } });
  }

  async findByProduct(productId: string, limit = 50): Promise<InventoryMovement[]> {
    return prisma.inventoryMovement.findMany({
      where: { tenantId: this.tenantId, productId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
