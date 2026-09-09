// NexoCore — CRM Deal Move API
// POST /api/crm/deals/:id/move  → move deal to a new pipeline stage (drag-and-drop)

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { DealRepository } from "@/modules/crm/repositories/deal.repository";
import { PipelineStageRepository } from "@/modules/crm/repositories/pipeline.repository";
import { dealMoveSchema } from "@/modules/crm/schemas/crm.schema";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getTenantSession();
  const dealRepo = new DealRepository(session.tenantId);
  const stageRepo = new PipelineStageRepository(session.tenantId);
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = dealMoveSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify the deal belongs to this tenant
    const existing = await dealRepo.findById(id);
    if (!existing) {
      return NextResponse.json({ error: "Negociación no encontrada" }, { status: 404 });
    }

    // Find the target stage to check if it's won/lost/closed
    const stage = await stageRepo.findByName(parsed.data.newStage);
    const stageMeta = stage
      ? { isWon: stage.isWon, isLost: stage.isLost, isClosed: stage.isClosed }
      : undefined;

    const updated = await dealRepo.moveStage(id, parsed.data.newStage, stageMeta);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Error al mover la negociación" },
      { status: 500 }
    );
  }
}
