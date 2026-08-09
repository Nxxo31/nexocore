// NexoCore — CRM Deal by ID API
// GET    /api/crm/deals/:id  → get single deal
// PATCH  /api/crm/deals/:id  → update deal
// DELETE /api/crm/deals/:id  → delete deal

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { DealRepository } from "@/modules/crm/repositories/deal.repository";
import { dealUpdateSchema } from "@/modules/crm/schemas/crm.schema";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new DealRepository(session.tenantId);
  const { id } = await params;

  const deal = await repo.findById(id);
  if (!deal) {
    return NextResponse.json({ error: "Negociación no encontrada" }, { status: 404 });
  }
  return NextResponse.json(deal);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new DealRepository(session.tenantId);
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = dealUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await repo.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Negociación no encontrada" }, { status: 404 });
    }

    const updated = await repo.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar negociación" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new DealRepository(session.tenantId);
  const { id } = await params;

  const existing = await repo.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Negociación no encontrada" }, { status: 404 });
  }

  try {
    await repo.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar negociación" },
      { status: 500 }
    );
  }
}
