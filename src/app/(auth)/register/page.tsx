// NexoCore — Register page with niche selector

import { TemplateFactory } from "@/modules/templates/templates";
import Link from "next/link";

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { template?: string };
}) {
  const industries = TemplateFactory.getIndustries();
  const selectedTemplate = searchParams.template
    ? TemplateFactory.getById(searchParams.template)
    : null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
            Crea tu cuenta en NexoCore
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400">
            Elige el tipo de negocio y tienes un ERP listo para tu industria
          </p>
        </div>

        {/* Niche selector grid */}
        {!selectedTemplate && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind) => (
              <Link
                key={ind.id}
                href={`/register?template=${ind.id}`}
                className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">
                  {ind.name}
                </h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  {ind.description}
                </p>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-blue-600">
                  Configurar →
                </span>
              </Link>
            ))}
          </div>
        )}

        {/* Registration form when template selected */}
        {selectedTemplate && (
          <div className="mx-auto max-w-md">
            <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                <strong>Plantilla:</strong> {selectedTemplate.name}
              </p>
              <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
                {selectedTemplate.description}
              </p>
            </div>

            <form className="space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  name="businessName"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Ej: Ferretería El Tornillo S.A."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="admin@ferreteria.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Mínimo 8 caracteres"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    name="city"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Bogotá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Moneda
                  </label>
                  <select
                    name="currency"
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="COP">COP (Colombia)</option>
                    <option value="USD">USD</option>
                    <option value="MXN">MXN (México)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700"
              >
                Crear cuenta y configurar workspace
              </button>
            </form>

            <div className="mt-4 text-center">
              <Link
                href="/register"
                className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400"
              >
                ← Cambiar plantilla
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
