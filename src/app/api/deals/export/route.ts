// NexoCore — Deals Export API (XLSX via exceljs)
// GET /api/deals/export → returns Excel .xlsx file of all tenant deals

import { NextRequest, NextResponse } from "next/server";
import { getTenantSession } from "@/shared/auth/session";
import { DealRepository } from "@/modules/crm/repositories/deal.repository";
import { AuditService } from "@/modules/audit/services/audit.service";

export async function GET() {
  const session = await getTenantSession();
  const repo = new DealRepository(session.tenantId);

  try {
    // Fetch all deals with relations (large batch for export)
    const result = await repo.findMany({}, { take: 10000 });
    const deals = result.data;

    // Dynamically import exceljs (uses Node builtins — serverExternalPackages in next.config)
    const ExcelJS = await import("exceljs");
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Deals", {
      properties: { tabColor: { argb: "FF2563EB" } },
    });

    // Define columns with headers and widths
    worksheet.columns = [
      { header: "ID", key: "id", width: 25 },
      { header: "Título", key: "title", width: 30 },
      { header: "Valor", key: "value", width: 15 },
      { header: "Etapa", key: "stage", width: 20 },
      { header: "Probabilidad (%)", key: "probability", width: 12 },
      { header: "Contacto", key: "contactName", width: 25 },
      { header: "Email Contacto", key: "contactEmail", width: 28 },
      { header: "Empresa", key: "contactCompany", width: 25 },
      { header: "Asignado a", key: "assignedTo", width: 20 },
      { header: "Cierre esperado", key: "expectedCloseAt", width: 18 },
      { header: "Cerrado", key: "closedAt", width: 18 },
      { header: "Ganado", key: "wonAt", width: 18 },
      { header: "Perdido", key: "lostAt", width: 18 },
      { header: "Razón pérdida", key: "lostReason", width: 30 },
      { header: "Creado", key: "createdAt", width: 18 },
      { header: "Actualizado", key: "updatedAt", width: 18 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF2563EB" },
    };
    worksheet.getRow(1).alignment = { vertical: "middle" };

    // Add rows
    for (const deal of deals) {
      const row = worksheet.addRow({
        id: deal.id,
        title: deal.title,
        value: Number(deal.value),
        stage: deal.stage,
        probability: deal.probability,
        contactName: "contact" in deal ? (deal as Record<string, unknown>).contact && typeof (deal as Record<string, unknown>).contact === "object" ? ((deal as Record<string, Record<string, unknown>>).contact?.name as string) ?? "" : "" : "",
        contactEmail: "",
        contactCompany: "",
        assignedTo: deal.assignedTo ?? "",
        expectedCloseAt: deal.expectedCloseAt ? new Date(deal.expectedCloseAt) : null,
        closedAt: deal.closedAt ? new Date(deal.closedAt) : null,
        wonAt: deal.wonAt ? new Date(deal.wonAt) : null,
        lostAt: deal.lostAt ? new Date(deal.lostAt) : null,
        lostReason: deal.lostReason ?? "",
        createdAt: deal.createdAt ? new Date(deal.createdAt) : null,
        updatedAt: deal.updatedAt ? new Date(deal.updatedAt) : null,
      });

      // Format date cells
      for (const col of ["expectedCloseAt", "closedAt", "wonAt", "lostAt", "createdAt", "updatedAt"]) {
        const cell = row.getCell(col);
        if (cell.value) {
          cell.numFmt = "yyyy-mm-dd";
        }
      }
      // Format value as currency
      const valueCell = row.getCell("value");
      valueCell.numFmt = '"$"#,##0.00';
    }

    // Auto-filter
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: worksheet.columns.length },
    };

    // Generate the XLSX buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Audit the export action
    await AuditService.logExport(session.tenantId, session.userId, "Deal", {
      format: "xlsx",
      count: deals.length,
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="deals-${dateStr}.xlsx"`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Error al exportar negociaciones" },
      { status: 500 }
    );
  }
}
