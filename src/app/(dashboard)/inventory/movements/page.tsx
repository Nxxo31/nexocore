// NexoCore — Inventory Movements Page (Server Component)
// Lists inventory movements (entries/exits/adjustments) with product relation.

import { getTenantSession } from "@/shared/auth/session";
import { InventoryMovementRepository } from "@/modules/inventory/repositories/movement.repository";
import { TemplateFactory } from "@/modules/templates/templates";
import { ArrowLeftRight, Plus } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ cursor?: string }>;
}

const MOVEMENT_TYPE_LABELS: Record<string, string> = {
  IN: "Entrada",
  OUT: "Salida",
  ADJUSTMENT: "Ajuste",
  TRANSFER: "Transferencia",
};

export default async function movementsPage({ searchParams }: PageProps) {
  const session = await getTenantSession();
  const repo = new InventoryMovementRepository(session.tenantId);
  const template = TemplateFactory.create(session.industry);

  const { cursor } = await searchParams;

  let result;
  try {
    result = await repo.findMany({}, { cursor });
  } catch {
    result = { data: [], nextCursor: null, total: 0 };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Movimientos de inventario
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {result.total} movimiento{result.total !== 1 ? "s" : ""} registrado{result.total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/inventory/movements/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo movimiento
        </Link>
      </div>

      {result.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <ArrowLeftRight className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            No hay movimientos. Crea uno para registrar entrada/salida de {template.vocabulary.product.toLowerCase()}s.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">{template.vocabulary.product}</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Cantidad</th>
                <th className="px-4 py-3">Notas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {result.data.map((m) => {
                const product = "product" in m ? (m as { product?: { name: string; sku: string | null } }).product : null;
                const signed = m.type === "OUT" ? "-" : "+";
                return (
                  <tr key={m.id} className="text-slate-700 dark:text-slate-300">
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {m.createdAt ? new Date(m.createdAt).toLocaleString("es-CO") : "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {product?.name ?? "—"}
                      {product?.sku && (
                        <span className="ml-2 font-mono text-xs text-slate-500">({product.sku})</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {MOVEMENT_TYPE_LABELS[m.type] ?? m.type}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono tabular-nums ${signed === "-" ? "text-red-600" : "text-green-600"}`}>
                      {signed}{Number(m.quantity)}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{m.reason ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {result.nextCursor && (
        <div className="flex justify-center">
          <Link
            href={`/dashboard/inventory/movements?cursor=${result.nextCursor}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cargar más
          </Link>
        </div>
      )}
    </div>
  );
}
