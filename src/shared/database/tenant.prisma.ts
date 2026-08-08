// NexoCore — Tenant Prisma Middleware
// Inyecta tenant_id automáticamente en cada query

import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

/**
 * Middleware que inyecta tenant_id en cada query de Prisma.
 * Esto garantiza que ningún route handler pueda accidentalmente
 * hacer una query sin filtrar por tenant.
 *
 * Uso: setTenantContext(tenantId) antes de cualquier operación.
 */
let currentTenantId: string | null = null;

export function setTenantContext(tenantId: string) {
  currentTenantId = tenantId;
}

export function getTenantContext(): string | null {
  return currentTenantId;
}

export function clearTenantContext() {
  currentTenantId = null;
}

// Modelos que tienen tenantId
const TENANT_MODELS = [
  "Product",
  "InventoryMovement",
  "Supplier",
  "PurchaseOrder",
  "Contact",
  "Deal",
  "Activity",
  "Invoice",
  "InvoiceItem",
  "Payment",
  "KpiSnapshot",
  "Alert",
];

prisma.$use(async (params, next) => {
  if (!currentTenantId) {
    // No tenant context set — let it pass (system-level queries like auth)
    return next(params);
  }

  const model = params.model;
  if (!model || !TENANT_MODELS.includes(model)) {
    return next(params);
  }

  // Inyectar tenantId en filter
  if (params.action === "findUnique" || params.action === "findUniqueOrThrow") {
    if (params.args && params.args.where) {
      params.args.where = { ...params.args.where, tenantId: currentTenantId };
    }
  } else if (params.action.includes("findMany") || params.action.includes("find")) {
    if (params.args) {
      params.args.where = params.args.where || {};
      params.args.where.tenantId = currentTenantId;
    }
  } else if (params.action === "create" || params.action === "createMany") {
    if (params.args && params.args.data) {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((d: Record<string, unknown>) => ({
          ...d,
          tenantId: currentTenantId,
        }));
      } else {
        params.args.data = { ...params.args.data, tenantId: currentTenantId };
      }
    }
  } else if (params.action === "update" || params.action === "updateMany") {
    if (params.args && params.args.where) {
      params.args.where = { ...params.args.where, tenantId: currentTenantId };
    }
  } else if (params.action === "delete" || params.action === "deleteMany") {
    if (params.args && params.args.where) {
      params.args.where = { ...params.args.where, tenantId: currentTenantId };
    }
  }

  return next(params);
});
