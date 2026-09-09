// NexoCore — NextAuth v5 Type Augmentation
// Extiende Session y JWT con campos multi-tenant

import type { DefaultSession } from "next-auth";

export interface TenantClaims {
  tenantId?: string;
  tenantSlug?: string;
  industry?: string;
  plan?: string;
  role?: string;
}

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    } & TenantClaims;
  }

  interface User extends TenantClaims {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends TenantClaims {
    uid?: string;
  }
}
