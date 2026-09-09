// NexoCore — CRM Contact by ID API
// GET    /api/crm/contacts/:id  → get single contact
// PATCH  /api/crm/contacts/:id  → update contact
// DELETE /api/crm/contacts/:id  → delete contact

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { ContactRepository } from "@/modules/crm/repositories/contact.repository";
import { contactUpdateSchema } from "@/modules/crm/schemas/crm.schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new ContactRepository(session.tenantId);
  const { id } = await params;

  const contact = await repo.findById(id);
  if (!contact) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }
  return NextResponse.json(contact);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new ContactRepository(session.tenantId);
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = contactUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await repo.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
    }

    const updated = await repo.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar contacto" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new ContactRepository(session.tenantId);
  const { id } = await params;

  const existing = await repo.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Contacto no encontrado" }, { status: 404 });
  }

  try {
    await repo.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar contacto" },
      { status: 500 }
    );
  }
}
