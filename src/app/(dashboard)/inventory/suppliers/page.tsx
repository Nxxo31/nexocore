// NexoCore — Inventory Suppliers Page (Server Component)
// Lists suppliers with search by name.

import { getTenantSession } from "@/shared/auth/session";
import { SupplierRepository } from "@/modules/inventory/repositories/supplier.repository";
import { TemplateFactory } from "@/modules/templates/templates";
import { Plus, Search, Truck } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ cursor?: string; search?: string }>;
}

export default async function suppliersPage({ searchParams }: PageProps) {
  const session = await getTenantSession();
  const repo = new SupplierRepository(session.tenantId);
  const template = TemplateFactory.create(session.industry);

  const { cursor, search } = await searchParams;

  let result;
  try {
    if (search) {
      const found = await repo.searchByName(search, 50);
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
            Proveedores
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {result.total} proveedor{result.total !== 1 ? "es" : ""} registrado{result.total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/inventory/suppliers/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo proveedor
        </Link>
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder="Buscar por nombre..."
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
          <Truck className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-600" />
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
            No hay proveedores. Agrega uno para registrar {template.vocabulary.product.toLowerCase()}s comprados.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Teléfono</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {result.data.map((s) => (
                <tr key={s.id} className="text-slate-700 dark:text-slate-300">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{s.name}</td>
                  <td className="px-4 py-3">{s.contact ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.email ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{s.phone ?? "—"}</td>
                  <td className="px-4 py-3">
                    {s.isActive ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Inactivo
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {result.nextCursor && (
        <div className="flex justify-center">
          <Link
            href={`/dashboard/inventory/suppliers?cursor=${result.nextCursor}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cargar más
          </Link>
        </div>
      )}
    </div>
  );
}
