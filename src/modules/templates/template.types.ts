// NexoCore — Template Types
// Define la configuración completa de cada plantilla de nicho

export type Industry =
  | "FERRETERIA"
  | "RESTAURANTE"
  | "CONSULTORA"
  | "RETAIL"
  | "CLINICA"
  | "PAPELERIA"
  | "CARNICERIA";

export type Plan = "STARTER" | "PRO" | "ENTERPRISE";

// --- Vocabulario de la UI ---

export interface Vocabulary {
  product: string; // 'Referencia' | 'Plato' | 'Servicio' | 'Prenda' | etc.
  client: string; // 'Comprador' | 'Comensal' | 'Cliente' | 'Paciente' | etc.
  deal: string; // 'Pedido' | 'Mesa' | 'Proyecto' | 'Cita' | etc.
  invoice: string; // 'Factura' | 'Cuenta' | 'Propuesta' | 'Recibo' | etc.
}

// --- Módulos ---

export interface ModuleConfig {
  inventory: boolean;
  crm: boolean;
  invoicing: boolean;
  analytics: boolean;
  scheduling: boolean;
  projects: boolean;
}

// --- Campos personalizados ---

export interface FieldConfig {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "date" | "textarea" | "boolean";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

// --- Pipeline CRM ---

export interface PipelineStage {
  id: string;
  name: string;
  probability: number;
  color: string;
  isWon?: boolean;
  isLost?: boolean;
}

// --- KPIs ---

export interface KpiDefinition {
  key: string;
  label: string;
  formula: string;
  unit: string;
  target?: number;
  dataSource: "products" | "contacts" | "deals" | "invoices" | "movements";
}

// --- Alertas ---

export interface AlertRule {
  key: string;
  type: "STOCK_LOW" | "INVOICE_OVERDUE" | "DEAL_STALE" | "ORDER_DELAYED";
  condition: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  body: string;
}

// --- Navegación (sidebar) ---

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  enabled: boolean;
}

// --- Plantilla completa ---

export interface NicheTemplate {
  id: string;
  name: string;
  industry: Industry;
  description: string;
  vocabulary: Vocabulary;
  modules: ModuleConfig;
  productFields: FieldConfig[];
  pipelineStages: PipelineStage[];
  kpis: KpiDefinition[];
  alertRules: AlertRule[];
  navItems: NavItem[];
  sampleCategories: string[];
}
