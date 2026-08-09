// NexoCore — CRM Contacts Page (Server Component)
// Lists contacts with cursor-based pagination and search

import { getTenantSession } from "@/shared/auth/session";
import { ContactRepository } from "@/modules/crm/repositories/contact.repository";
import { TemplateFactory } from "@/modules/templates/templates";
import { ContactsTable } from "@/modules/crm/components/contacts-table";
import { Plus, Search } from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ cursor?: string; search?: string }>;
}

export default async function ContactsPage({ searchParams }: PageProps) {
  const session = await getTenantSession();
  const repo = new ContactRepository(session.tenantId);
  const template = TemplateFactory.create(session.industry);

  const { cursor, search } = await searchParams;

  let result;
  try {
    if (search) {
      const searchData = await repo.searchByNameOrEmail(search);
      result = { data: searchData, nextCursor: null, total: searchData.length };
    } else {
      result = await repo.findMany({}, { cursor });
    }
  } catch {
    result = { data: [], nextCursor: null, total: 0 };
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {template.vocabulary.client}s
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            {result.total} {template.vocabulary.client.toLowerCase()}
            {result.total !== 1 ? "s" : ""} registrado
            {result.total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/dashboard/crm/contacts/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nuevo {template.vocabulary.client}
        </Link>
      </div>

      {/* Search bar */}
      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            name="search"
            defaultValue={search || ""}
            placeholder={`Buscar por nombre, email o empresa...`}
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

      {/* Contacts table */}
      <ContactsTable initialContacts={result.data} />

      {/* Pagination */}
      {result.nextCursor && (
        <div className="flex justify-center">
          <Link
            href={`/dashboard/crm/contacts?cursor=${result.nextCursor}`}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cargar más
          </Link>
        </div>
      )}
    </div>
  );
}
