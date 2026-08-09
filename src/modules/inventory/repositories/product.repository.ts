// NexoCore — Product Repository (Tenant-isolated)
import { prisma } from "@/shared/database/prisma";
import { PaginatedResult, PaginationParams, TenantRepository } from "@/shared/database/base.repository";
import type { Product, Prisma } from "@prisma/client";

export class ProductRepository extends TenantRepository<Product> {
  protected get model(): string {
    return "product";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<Product>> {
    const { cursor, take = 20, skip = 0 } = pagination;

    const [data, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: { ...filters },
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
      }),
      prisma.product.count({ where: { ...filters } }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({ where: { id } });
  }

  async create(data: Record<string, unknown>): Promise<Product> {
    return prisma.product.create({ data as Prisma.ProductCreateInput });
  }

  async update(id: string, data: Record<string, unknown>): Promise<Product> {
    return prisma.product.update({ where: { id }, data: data as Prisma.ProductUpdateInput });
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } });
  }

  // Métodos específicos de inventario
  async lowStockAlert(tenantId: string): Promise<Product[]> {
    // Field-to-field comparison: currentStock <= minStock
    // Using raw query for performance and compatibility
    const products = await prisma.$queryRaw<Product[]>`
      SELECT * FROM "Product"
      WHERE "tenantId" = ${tenantId}
        AND "currentStock" <= "minStock"
        AND "isActive" = true
    `;
    return products;
  }

  async searchByNameOrSku(
    tenantId: string,
    query: string,
    limit: number = 10
  ): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  }
}