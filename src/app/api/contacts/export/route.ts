// NexoCore — Contacts Export API (CSV)
// GET /api/contacts/export → returns CSV file of all tenant contacts

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { ContactRepository } from "@/modules/crm/repositories/contact.repository";
import { AuditService } from "@/modules/audit/services/audit.service";

function escapeCsvField(value: string | null | undefined): string {
  if (value === null || value === undefined) return "";
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  const escaped = value.replace(/"/g, '""');
  if (escaped.includes(",") || escaped.includes("\n") || escaped.includes('"')) {
    return `"${escaped}"`;
  }
  return escaped;
}

export async function GET(request: NextRequest) {
  const session = await getTenantSession();
  const repo = new ContactRepository(session.tenantId);

  try {
    // Fetch all contacts (no pagination for export — take a large batch)
    const result = await repo.findMany({}, { take: 10000 });
    const contacts = result.data;

    // CSV headers
    const headers = [
      "id",
      "name",
      "email",
      "phone",
      "company",
      "documentType",
      "document",
      "address",
      "tags",
      "stage",
      "assignedTo",
      "isActive",
      "lastContactAt",
      "createdAt",
      "updatedAt",
    ];

    // Build CSV rows
    const rows = contacts.map((c) =>
      [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.documentType,
        c.document,
        c.address,
        Array.isArray(c.tags) ? c.tags.join("; ") : "",
        c.stage,
        c.assignedTo,
        c.isActive ? "true" : "false",
        c.lastContactAt ? c.lastContactAt.toISOString() : "",
        c.createdAt ? c.createdAt.toISOString() : "",
        c.updatedAt ? c.updatedAt.toISOString() : "",
      ]
        .map((v) => escapeCsvField(String(v ?? "")))
        .join(",")
    );

    const csv = [headers.join(","), ...rows].join("\n");

    // Audit the export action
    await AuditService.logExport(session.tenantId, session.userId, "Contact", {
      format: "csv",
      count: contacts.length,
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="contacts-${dateStr}.csv"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al exportar contactos" },
      { status: 500 }
    );
  }
}
