// NexoCore — CRM Pipeline Stage by ID API
// PATCH  /api/crm/pipeline/:id  → update stage
// DELETE /api/crm/pipeline/:id  → delete stage

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { PipelineStageRepository } from "@/modules/crm/repositories/pipeline.repository";
import { stageUpdateSchema } from "@/modules/crm/schemas/crm.schema";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new PipelineStageRepository(session.tenantId);
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = stageUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const existing = await repo.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Etapa no encontrada" }, { status: 404 });
    }

    const updated = await repo.update(id, parsed.data);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al actualizar etapa" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const repo = new PipelineStageRepository(session.tenantId);
  const { id } = await params;

  const existing = await repo.findById(id);
  if (!existing) {
    return NextResponse.json({ error: "Etapa no encontrada" }, { status: 404 });
  }

  try {
    await repo.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json(
      { error: "Error al eliminar etapa" },
      { status: 500 }
    );
  }
}
