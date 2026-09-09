// NexoCore — CRM Contacts API
// GET  /api/crm/contacts     → list with cursor-based pagination
// POST /api/crm/contacts     → create new contact

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { ContactRepository } from "@/modules/crm/repositories/contact.repository";
import { contactCreateSchema } from "@/modules/crm/schemas/crm.schema";

export async function GET(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new ContactRepository(session.tenantId);

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;
  const take = parseInt(searchParams.get("take") || "20", 10);
  const search = searchParams.get("search");

  try {
    const filters: Record<string, unknown> = {};
    if (search) {
      // Use searchByNameOrEmail for search param
      const results = await repo.searchByNameOrEmail(search, take);
      return NextResponse.json({
        data: results,
        nextCursor: null,
        total: results.length,
      });
    }

    const result = await repo.findMany(filters, { cursor, take });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener contactos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new ContactRepository(session.tenantId);

  try {
    const body = await request.json();
    const parsed = contactCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const contact = await repo.create(parsed.data);
    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear contacto" },
      { status: 500 }
    );
  }
}
