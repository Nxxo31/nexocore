// NexoCore — CRM Deals API
// GET  /api/crm/deals  → list deals (supports stage filter, cursor pagination)
// POST /api/crm/deals  → create new deal

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { DealRepository } from "@/modules/crm/repositories/deal.repository";
import { dealCreateSchema } from "@/modules/crm/schemas/crm.schema";

export async function GET(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new DealRepository(session.tenantId);

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;
  const take = parseInt(searchParams.get("take") || "20", 10);
  const stage = searchParams.get("stage");
  const groupByStage = searchParams.get("groupByStage") === "true";

  try {
    if (groupByStage) {
      const [byStage, summary] = await Promise.all([
        repo.findByStages(),
        repo.getPipelineSummary(),
      ]);
      return NextResponse.json({ byStage, summary });
    }

    const filters: Record<string, unknown> = {};
    if (stage) filters.stage = stage;

    const result = await repo.findMany(filters, { cursor, take });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener negociaciones" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new DealRepository(session.tenantId);

  try {
    const body = await request.json();
    const parsed = dealCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const deal = await repo.create(parsed.data);
    return NextResponse.json(deal, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Error al crear negociación" },
      { status: 500 }
    );
  }
}
