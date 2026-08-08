// NexoCore — Dashboard home
// Resumen con KPIs del template activo

import { TemplateFactory } from "@/modules/templates/templates";
import type { Industry } from "@/modules/templates/template.types";
import { BarChart3, TrendingUp, Package, Users, FileText, AlertTriangle } from "lucide-react";

export default function DashboardPage() {
  // TODO: from session JWT
  const industry: Industry = "FERRETERIA";
  const template = TemplateFactory.create(industry);

  // Demo KPI values (Sprint 2-4 will replace with real data)
  const demoKpis = template.kpis.slice(0, 4).map((kpi, i) => ({
    ...kpi,
    value: ["1,247", "28.5%", "23", "$4.2M"][i] || "—",
    trend: ["up", "up", "down", "neutral"][i] || "neutral",
  }));

  const demoAlerts = [
    { severity: "WARNING", title: `Stock bajo en 3 ${template.vocabulary.product}s`, time: "hace 1h" },
    { severity: "INFO", title: `Nueva ${template.vocabulary.client} registrada`, time: "hace 2h" },
    { severity: "CRITICAL", title: `2 ${template.vocabulary.invoice}s vencidas`, time: "hace 4h" },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Resumen de {template.name}
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-400">
          {template.vocabulary.product === "Referencia"
            ? "Gestiona tus referencias, pedidos y facturas"
            : `Gestiona tus ${template.vocabulary.product.toLowerCase()}s y ${template.vocabulary.client.toLowerCase()}s`}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {demoKpis.map((kpi) => (
          <div
            key={kpi.key}
            className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {kpi.label}
              </p>
              <TrendingUp className="h-4 w-4 text-slate-400" />
            </div>
            <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
              {kpi.value}
              {kpi.unit && kpi.unit !== "" ? ` ${kpi.unit}` : ""}
            </p>
          </div>
        ))}
      </div>

      {/* Two-column: recent activity + alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Actividad reciente
          </h3>
          <div className="space-y-3">
            {[
              { icon: Package, text: `Nuevo ${template.vocabulary.product} agregado`, time: "hace 30 min" },
              { icon: Users, text: `Nuevo ${template.vocabulary.client} en CRM`, time: "hace 1h" },
              { icon: FileText, text: `${template.vocabulary.invoice} #00124 creada`, time: "hace 3h" },
              { icon: BarChart3, text: "KPIs diarios calculados", time: "hace 6h" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <item.icon className="h-4 w-4 text-slate-500" />
                </div>
                <span className="text-slate-700 dark:text-slate-300">{item.text}</span>
                <span className="ml-auto text-slate-400">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Alertas
            </h3>
          </div>
          <div className="space-y-3">
            {demoAlerts.map((alert, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-sm ${
                  alert.severity === "CRITICAL"
                    ? "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                    : alert.severity === "WARNING"
                    ? "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                    : "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                }`}
              >
                <p className="font-medium">{alert.title}</p>
                <p className="mt-0.5 text-xs opacity-70">{alert.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
