// NexoCore — CRM Pipeline Stages API
// GET   /api/crm/pipeline         → list all pipeline stages (ordered by position)
// POST  /api/crm/pipeline         → create new stage
// PATCH /api/crm/pipeline/reorder → bulk reorder stages

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { PipelineStageRepository } from "@/modules/crm/repositories/pipeline.repository";
import { stageCreateSchema } from "@/modules/crm/schemas/crm.schema";

export async function GET() {
  const session = await getTenantSession();
  const repo = new PipelineStageRepository(session.tenantId);

  try {
    const stages = await repo.findOrdered();
    return NextResponse.json({ data: stages });
  } catch {
    return NextResponse.json(
      { error: "Error al obtener pipeline" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new PipelineStageRepository(session.tenantId);

  try {
    const body = await request.json();
    const parsed = stageCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Determine the next position
    const existing = await repo.findOrdered();
    const position = existing.length;

    const stage = await repo.create({ ...parsed.data, position });
    return NextResponse.json(stage, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear etapa" },
      { status: 500 }
    );
  }
}
