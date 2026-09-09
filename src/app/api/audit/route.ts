// NexoCore — Audit Log API
// GET /api/audit  → list audit entries for the active tenant (with filters)

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { AuditLogRepository } from "@/modules/audit/repositories/audit.repository";

export async function GET(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new AuditLogRepository(session.tenantId);

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;
  const take = parseInt(searchParams.get("take") || "50", 10);
  const action = searchParams.get("action") || undefined;
  const entity = searchParams.get("entity") || undefined;
  const userId = searchParams.get("userId") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;

  const filters: Record<string, unknown> = {};
  if (action) filters.action = action;
  if (entity) filters.entity = entity;
  if (userId) filters.userId = userId;
  if (startDate) filters.startDate = new Date(startDate);
  if (endDate) filters.endDate = new Date(endDate);

  try {
    const result = await repo.findMany(filters, { cursor, take });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Error al obtener audit logs" },
      { status: 500 }
    );
  }
}
