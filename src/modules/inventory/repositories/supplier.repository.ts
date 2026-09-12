// NexoCore — Supplier Repository (Tenant-isolated)
// Manages supplier records (companies or individuals that supply inventory).

import { prisma } from "@/shared/database/prisma";
import {
  PaginatedResult,
  PaginationParams,
  TenantRepository,
} from "@/shared/database/base.repository";
import type { Supplier, Prisma } from "@prisma/client";

export class SupplierRepository extends TenantRepository<Supplier> {
  protected get model(): string {
    return "supplier";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<Supplier>> {
    const { cursor, take = 20, skip = 0 } = pagination;

    const where: Prisma.SupplierWhereInput = {
      tenantId: this.tenantId,
      ...filters,
    };

    const [data, total] = await prisma.$transaction([
      prisma.supplier.findMany({
        where,
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: "asc" },
      }),
      prisma.supplier.count({ where }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<Supplier | null> {
    return prisma.supplier.findFirst({ where: { id, tenantId: this.tenantId } });
  }

  async create(data: Record<string, unknown>): Promise<Supplier> {
    return prisma.supplier.create({
      data: { ...data, tenantId: this.tenantId } as unknown as Prisma.SupplierCreateInput,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<Supplier> {
    return prisma.supplier.update({
      where: { id, tenantId: this.tenantId },
      data: data as unknown as Prisma.SupplierUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.supplier.delete({ where: { id, tenantId: this.tenantId } });
  }

  async searchByName(query: string, limit = 10): Promise<Supplier[]> {
    return prisma.supplier.findMany({
      where: {
        tenantId: this.tenantId,
        isActive: true,
        name: { contains: query, mode: "insensitive" },
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  }
}
