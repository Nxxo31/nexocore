// NexoCore — Base Template
// Define los defaults que todas las plantillas heredan

import type { NicheTemplate, ModuleConfig, NavItem } from "./template.types";

export const BASE_MODULES: ModuleConfig = {
  inventory: true,
  crm: true,
  invoicing: true,
  analytics: true,
  scheduling: false,
  projects: false,
};

export const BASE_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "LayoutDashboard", enabled: true },
  { label: "Inventario", href: "/dashboard/inventory", icon: "Package", enabled: true },
  { label: "Movimientos", href: "/dashboard/inventory/movements", icon: "ArrowLeftRight", enabled: true },
  { label: "Proveedores", href: "/dashboard/inventory/suppliers", icon: "Truck", enabled: true },
  { label: "CRM", href: "/crm", icon: "Users", enabled: true },
  { label: "Contactos", href: "/crm/contacts", icon: "Contact", enabled: true },
  { label: "Facturación", href: "/dashboard/invoicing", icon: "FileText", enabled: false },
  { label: "Analytics", href: "/dashboard/analytics", icon: "BarChart3", enabled: false },
  { label: "Configuración", href: "/dashboard/settings", icon: "Settings", enabled: false },
];

export function createBaseTemplate(): Omit<NicheTemplate, "id" | "name" | "industry" | "description" | "vocabulary" | "productFields" | "pipelineStages" | "kpis" | "alertRules" | "sampleCategories"> {
  return {
    modules: { ...BASE_MODULES },
    navItems: [...BASE_NAV],
  };
}
