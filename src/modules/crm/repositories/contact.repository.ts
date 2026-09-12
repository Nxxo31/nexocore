// NexoCore — Contact Repository (Tenant-isolated)
// CRM contacts with cursor-based pagination

import { prisma } from "@/shared/database/prisma";
import {
  PaginatedResult,
  PaginationParams,
  TenantRepository,
} from "@/shared/database/base.repository";
import type { Contact, Prisma } from "@prisma/client";

export class ContactRepository extends TenantRepository<Contact> {
  protected get model(): string {
    return "contact";
  }

  async findMany(
    filters: Record<string, unknown> = {},
    pagination: PaginationParams = {}
  ): Promise<PaginatedResult<Contact>> {
    const { cursor, take = 20, skip = 0 } = pagination;

    const where: Prisma.ContactWhereInput = {
      tenantId: this.tenantId,
      ...filters,
    };

    const [data, total] = await prisma.$transaction([
      prisma.contact.findMany({
        where,
        take,
        skip,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { updatedAt: "desc" },
        include: { deals: { select: { id: true, title: true, value: true, stage: true } } },
      }),
      prisma.contact.count({ where }),
    ]);

    const nextCursor =
      data.length > 0 && data.length === take ? data[data.length - 1].id : null;

    return { data, nextCursor, total };
  }

  async findById(id: string): Promise<Contact | null> {
    return prisma.contact.findFirst({
      where: { id, tenantId: this.tenantId },
      include: { deals: true, activities: true },
    });
  }

  async create(data: Record<string, unknown>): Promise<Contact> {
    return prisma.contact.create({
      data: { ...data, tenantId: this.tenantId } as unknown as Prisma.ContactCreateInput,
    });
  }

  async update(id: string, data: Record<string, unknown>): Promise<Contact> {
    return prisma.contact.update({
      where: { id, tenantId: this.tenantId },
      data: data as unknown as Prisma.ContactUpdateInput,
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.contact.delete({ where: { id, tenantId: this.tenantId } });
  }

  async searchByNameOrEmail(query: string, limit: number = 10): Promise<Contact[]> {
    return prisma.contact.findMany({
      where: {
        tenantId: this.tenantId,
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { company: { contains: query, mode: "insensitive" } },
        ],
      },
      take: limit,
      orderBy: { name: "asc" },
    });
  }
}
