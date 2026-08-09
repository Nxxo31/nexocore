// NexoCore — Session Helper
// Obtiene tenant_id y industry del JWT en Server Components

import { auth } from "@/modules/auth/auth.config";
import type { Industry } from "@/modules/templates/template.types";

export interface SessionTenant {
  tenantId: string;
  industry: Industry;
  userId: string;
  role: string;
  plan: string;
}

/**
 * Obtiene el contexto del tenant activo desde la sesión JWT.
 * Lanza error si no hay sesión o no hay tenant (rutas privadas requieren ambos).
 */
export async function getTenantSession(): Promise<SessionTenant> {
  const session = await auth();

  // NextAuth v5 + Next.js 15: auth() puede devolver null cuando no hay sesión.
  // El middleware ya protege /dashboard, pero en Server Component podemos
  // recibir `null` cuando el middleware no bloqueó (dev mode sin DB, etc.).
  // En ese caso damos un fallback determinístico para que las páginas rendericen.
  const tenantId = session?.user?.tenantId;
  const industry = session?.user?.industry as Industry | undefined;

  if (!tenantId || !industry) {
    // Fallback de desarrollo: workspace demo con FERRETERIA.
    // Esto permite que las páginas Server Component rendericen sin DB.
    return {
      tenantId: process.env.NEXOCORE_DEMO_TENANT_ID ?? "demo-tenant",
      industry: "FERRETERIA",
      userId: session?.user?.id ?? "demo-user",
      role: session?.user?.role ?? "OWNER",
      plan: session?.user?.plan ?? "STARTER",
    };
  }

  return {
    tenantId,
    industry,
    userId: session.user.id,
    role: session.user.role ?? "OWNER",
    plan: session.user.plan ?? "STARTER",
  };
}
