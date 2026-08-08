// NexoCore — Onboarding page
// Setup inicial del workspace después de registrarse

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateFactory } from "@/modules/templates/templates";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [city, setCity] = useState("");
  const [currency, setCurrency] = useState("COP");
  const [logoUrl, setLogoUrl] = useState("");
  const industries = TemplateFactory.getIndustries();
  const [selectedIndustry, setSelectedIndustry] = useState("");

  const handleCreateWorkspace = async () => {
    // TODO: server action to create workspace
    // POST /api/workspace with { name, slug, industry, city, currency, logoUrl }
    const res = await fetch("/api/workspace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: businessName,
        slug,
        industry: selectedIndustry,
        templateId: selectedIndustry,
        city,
        currency,
        logoUrl: logoUrl || undefined,
      }),
    });

    if (res.ok) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl px-4 py-16">
        {/* Progress indicator */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-2 w-24 rounded-full ${s <= step ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-800"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                ¿Qué tipo de negocio tienes?
              </h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Selecciona tu nicho y pre-configuramos todo para ti
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {industries.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => {
                    setSelectedIndustry(ind.id);
                    setStep(2);
                  }}
                  className={`rounded-lg border-2 p-4 text-left transition hover:border-blue-500 ${
                    selectedIndustry === ind.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                      : "border-slate-200 dark:border-slate-800"
                  }`}
                >
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {ind.name}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    {ind.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Información del negocio
              </h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Estos datos configurarán tu workspace
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Nombre del negocio
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                  }}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="Ferretería El Tornillo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Slug (URL del workspace)
                </label>
                <div className="mt-1 flex rounded-md">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 bg-slate-50 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
                    nexocore.co/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                    className="block w-full rounded-r-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="ferreteria-el-tornillo"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Ciudad
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Bogotá"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Moneda
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="COP">COP (Colombia)</option>
                    <option value="USD">USD</option>
                    <option value="MXN">MXN (México)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Logo (opcional)
                </label>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  placeholder="URL del logo"
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(1)}
                className="rounded-md px-4 py-2 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400"
              >
                ← Atrás
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!businessName || !slug}
                className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                Continuar →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                ¡Todo listo!
              </h2>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Tu workspace se creará con la siguiente configuración
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-6 dark:bg-slate-800">
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-slate-500 dark:text-slate-400">Negocio:</dt>
                  <dd className="text-slate-900 dark:text-white">{businessName}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500 dark:text-slate-400">URL:</dt>
                  <dd className="text-slate-900 dark:text-white">nexocore.co/{slug}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500 dark:text-slate-400">Plantilla:</dt>
                  <dd className="text-slate-900 dark:text-white">
                    {TemplateFactory.getById(selectedIndustry)?.name}
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500 dark:text-slate-400">Ciudad:</dt>
                  <dd className="text-slate-900 dark:text-white">{city}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500 dark:text-slate-400">Moneda:</dt>
                  <dd className="text-slate-900 dark:text-white">{currency}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-950">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                ✓ Se crearán productos de ejemplo, categorías predefinidas y pipeline CRM
                para tu industria. Podrás editar todo después.
              </p>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setStep(2)}
                className="rounded-md px-4 py-2 text-sm text-slate-600 hover:text-slate-800 dark:text-slate-400"
              >
                ← Atrás
              </button>
              <button
                onClick={handleCreateWorkspace}
                className="rounded-md bg-green-600 px-6 py-2 text-white font-medium hover:bg-green-700"
              >
                Crear mi workspace →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
