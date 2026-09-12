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
    // Development-only fallback: permite renderizar sin DB cuando NEXOCORE_DEV_FALLBACK=1.
    // En producción NUNCA se cae a demo-tenant — se lanza error explícito para que el
    // middleware redirija a /login y el problema sea visible.
    if (process.env.NODE_ENV !== "production" && process.env.NEXOCORE_DEV_FALLBACK === "1") {
      return {
        tenantId: process.env.NEXOCORE_DEMO_TENANT_ID ?? "demo-tenant",
        industry: "FERRETERIA",
        userId: session?.user?.id ?? "demo-user",
        role: session?.user?.role ?? "OWNER",
        plan: session?.user?.plan ?? "STARTER",
      };
    }
    throw new Error(
      "getTenantSession: no authenticated session. User must sign in before accessing tenant-scoped routes."
    );
  }

  return {
    tenantId,
    industry,
    userId: session.user.id,
    role: session.user.role ?? "OWNER",
    plan: session.user.plan ?? "STARTER",
  };
}
