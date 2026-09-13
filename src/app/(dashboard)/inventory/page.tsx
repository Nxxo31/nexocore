// NexoCore — Inventory Products Page (Server Component)
// Lists products with cursor-based pagination and low-stock badge.

import { getTenantSession } from "@/shared/auth/session";
import { ProductRepository } from "@/modules/inventory/repositories/product.repository";
import { TemplateFactory } from "@/modules/templates/templates";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ cursor?: string; search?: string; lowStock?: string }>;
}

export default async function inventoryPage({ searchParams }: PageProps) {
  const session = await getTenantSession();
  const repo = new ProductRepository(session.tenantId);
  const template = TemplateFactory.create(session.industry);

  const { cursor, search, lowStock } = await searchParams;

  let result;
  try {
    if (lowStock === "1") {
      const low = await repo.lowStockAlert(session.tenantId);
      result = { data: low, nextCursor: null, total: low.length };
    } else if (search) {
      const found = await repo.searchByNameOrSku(session.tenantId, search, 50);
      result = { data: found, nextCursor: null, total: found.length };
    } else {
      result = await repo.findMany({}, { cursor });
    }
  } catch {
    result = { data: [], nextCursor: null, total: 0 };
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {template.vocabulary.product}s
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {result.total} {template.vocabulary.product.toLowerCase()}
            {result.total !== 1 ? "s" : ""} registrado
            {result.total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/dashboard/inventory?lowStock=1"
            className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300"
          >
            <AlertTriangle className="h-4 w-4" />
            Stock bajo ({result.data.filter((p) => Number(p.currentStock) <= Number(p.minStock)).length})
          </Link>
          <Link
            href="/dashboard/inventory/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo {template.vocabulary.product}
          </Link>
        </div>
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder={`Buscar por nombre o SKU...`}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Buscar
        </button>
      </form>

      {result.data.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
          <Package className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            No hay {template.vocabulary.product.toLowerCase()}s. Crea el primero para empezar.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3 text-right">Stock</th>
                <th className="px-4 py-3 text-right">Mínimo</th>
                <th className="px-4 py-3 text-right">Precio</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {result.data.map((p) => {
                const stock = Number(p.currentStock);
                const min = Number(p.minStock);
                const low = stock <= min;
                return (
                  <tr key={p.id} className="text-slate-700 dark:text-slate-300">
                    <td className="px-4 py-3 font-mono text-xs">{p.sku ?? "—"}</td>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                    <td className="px-4 py-3">{p.category ?? "—"}</td>
                    <td className="px-4 py-3 text-right tabular-nums">{stock} {p.unit ?? ""}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-slate-500">{min}</td>
                    <td className="px-4 py-3 text-right tabular-nums">${Number(p.salePrice).toFixed(2)}</td>
                    <td className="px-4 py-3">
                      {low ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-950 dark:text-red-300">
                          <AlertTriangle className="h-3 w-3" /> Stock bajo
                        </span>
                      ) : !p.isActive ? (
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          Inactivo
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                          OK
                        </span>
                      )}
                    </td>
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
            href={`/dashboard/inventory?cursor=${result.nextCursor}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cargar más
          </Link>
        </div>
      )}
    </div>
  );
}
