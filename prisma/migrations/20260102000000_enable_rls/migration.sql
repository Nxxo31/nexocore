-- Migration: enable_rls (PostgreSQL Row-Level Security)
-- Activates defense-in-depth multi-tenant enforcement at the DB level.
-- Even if app code forgets `where: { tenantId }`, RLS blocks cross-tenant reads/writes.
--
-- IMPORTANT: RLS requires a session variable `app.current_tenant_id` to be SET
-- on every connection before queries run. Use a Prisma extension or middleware
-- to set this from JWT context. See src/shared/database/prisma.ts for the
-- $extends hook that injects the tenant id into every transaction.

-- Helper function: read current tenant from session variable
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS text AS $$
  SELECT current_setting('app.current_tenant_id', true);
$$ LANGUAGE SQL STABLE;

-- Helper: tenant isolation predicate
CREATE OR REPLACE FUNCTION is_same_tenant(row_tenant_id text) RETURNS boolean AS $$
  SELECT row_tenant_id IS NOT NULL AND row_tenant_id = current_tenant_id();
$$ LANGUAGE SQL STABLE;

-- Enable RLS on all tenant-scoped tables
ALTER TABLE "Product"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InventoryMovement"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Supplier"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PurchaseOrder"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Contact"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Deal"               ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Activity"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PipelineStage"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "InvoiceItem"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment"            ENABLE ROW LEVEL SECURITY;
ALTER TABLE "KpiSnapshot"        ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Alert"              ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AuditLog"           ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription"       ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WorkspaceUser"      ENABLE ROW LEVEL SECURITY;

-- Per-table tenant isolation policies (USING + WITH CHECK)
-- Pattern: rows where tenantId matches the session variable.
-- Service role (migrations, jobs) bypasses by setting FORCE ROW LEVEL SECURITY = false
-- or by using a non-RLS connection (PrismaAccelerate pooler, etc.).

CREATE POLICY product_tenant_isolation ON "Product"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY inventory_movement_tenant_isolation ON "InventoryMovement"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY supplier_tenant_isolation ON "Supplier"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY purchase_order_tenant_isolation ON "PurchaseOrder"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY contact_tenant_isolation ON "Contact"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY deal_tenant_isolation ON "Deal"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY activity_tenant_isolation ON "Activity"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY pipeline_stage_tenant_isolation ON "PipelineStage"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY invoice_tenant_isolation ON "Invoice"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY invoice_item_tenant_isolation ON "InvoiceItem"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY payment_tenant_isolation ON "Payment"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY kpi_snapshot_tenant_isolation ON "KpiSnapshot"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY alert_tenant_isolation ON "Alert"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY audit_log_tenant_isolation ON "AuditLog"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY subscription_tenant_isolation ON "Subscription"
  USING (is_same_tenant("tenantId"))
  WITH CHECK (is_same_tenant("tenantId"));

CREATE POLICY workspace_user_tenant_isolation ON "WorkspaceUser"
  USING (is_same_tenant("workspaceId"))
  WITH CHECK (is_same_tenant("workspaceId"));
