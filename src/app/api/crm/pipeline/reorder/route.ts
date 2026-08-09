// NexoCore — CRM Pipeline Stage Reorder API
// PATCH /api/crm/pipeline/reorder  → bulk reorder stages after drag-and-drop

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { PipelineStageRepository } from "@/modules/crm/repositories/pipeline.repository";
import { stageReorderSchema } from "@/modules/crm/schemas/crm.schema";

export async function PATCH(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new PipelineStageRepository(session.tenantId);

  try {
    const body = await request.json();
    const parsed = stageReorderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await repo.reorder(parsed.data.stageIds);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Error al reordenar etapas" },
      { status: 500 }
    );
  }
}
