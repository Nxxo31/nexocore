// NexoCore — Template Factory
// 7 plantillas de nicho: ferretería, restaurante, consultora, retail,
// clínica, papelería, carnicería

import type {
  NicheTemplate,
  Industry,
  PipelineStage,
  FieldConfig,
  KpiDefinition,
  AlertRule,
  NavItem,
} from "./template.types";
import { BASE_MODULES, BASE_NAV } from "./base.template";

// ============================================================================
// PIPELINE STAGES por nicho
// ============================================================================

const PIPELINE_FERRETERIA: PipelineStage[] = [
  { id: "cotizacion", name: "Cotización", probability: 20, color: "bg-slate-500" },
  { id: "pedido", name: "Pedido", probability: 50, color: "bg-blue-500" },
  { id: "despacho", name: "Despacho", probability: 70, color: "bg-amber-500" },
  { id: "entregado", name: "Entregado", probability: 90, color: "bg-teal-500" },
  { id: "cobrado", name: "Cobrado", probability: 100, color: "bg-green-600", isWon: true },
];

const PIPELINE_RESTAURANTE: PipelineStage[] = [
  { id: "mesa-asignada", name: "Mesa asignada", probability: 20, color: "bg-slate-500" },
  { id: "orden-tomada", name: "Orden tomada", probability: 40, color: "bg-blue-500" },
  { id: "en-cocina", name: "En cocina", probability: 60, color: "bg-amber-500" },
  { id: "servido", name: "Servido", probability: 80, color: "bg-teal-500" },
  { id: "pagado", name: "Pagado", probability: 100, color: "bg-green-600", isWon: true },
];

const PIPELINE_CONSULTORA: PipelineStage[] = [
  { id: "lead", name: "Lead", probability: 10, color: "bg-slate-500" },
  { id: "reunion", name: "Reunión", probability: 25, color: "bg-blue-500" },
  { id: "propuesta", name: "Propuesta", probability: 50, color: "bg-indigo-500" },
  { id: "negociacion", name: "Negociación", probability: 70, color: "bg-amber-500" },
  { id: "firmado", name: "Firmado", probability: 100, color: "bg-green-600", isWon: true },
  { id: "activo", name: "Activo", probability: 100, color: "bg-emerald-600" },
];

const PIPELINE_RETAIL: PipelineStage[] = [
  { id: "visitante", name: "Visitante", probability: 10, color: "bg-slate-500" },
  { id: "primera-compra", name: "Primera compra", probability: 50, color: "bg-blue-500" },
  { id: "recurrente", name: "Recurrente", probability: 75, color: "bg-teal-500" },
  { id: "vip", name: "VIP", probability: 100, color: "bg-purple-600", isWon: true },
];

const PIPELINE_CLINICA: PipelineStage[] = [
  { id: "cita-agendada", name: "Cita agendada", probability: 30, color: "bg-slate-500" },
  { id: "confirmada", name: "Confirmada", probability: 50, color: "bg-blue-500" },
  { id: "atendida", name: "Atendida", probability: 80, color: "bg-teal-500" },
  { id: "facturada", name: "Facturada", probability: 90, color: "bg-amber-500" },
  { id: "cobrada", name: "Cobrada", probability: 100, color: "bg-green-600", isWon: true },
];

const PIPELINE_PAPELERIA = PIPELINE_FERRETERIA; // Similar: cotización → pedido → despacho → entregado → cobrado
const PIPELINE_CARNICERIA = PIPELINE_FERRETERIA;

// ============================================================================
// ALERT RULES por nicho
// ============================================================================

const ALERTS_FERRETERIA: AlertRule[] = [
  { key: "stock-bajo", type: "STOCK_LOW", condition: "currentStock <= minStock", severity: "WARNING", title: "Stock bajo mínimo", body: "La referencia {name} tiene {currentStock} {unit} (mínimo: {minStock})" },
  { key: "pedido-sin-despachar", type: "ORDER_DELAYED", condition: "stage=='pedido' AND age(hours) > 48", severity: "WARNING", title: "Pedido sin despachar >48h", body: "El pedido {title} lleva más de 48h sin despachar" },
  { key: "cartera-vencida", type: "INVOICE_OVERDUE", condition: "status=='OVERDUE'", severity: "CRITICAL", title: "Cartera vencida", body: "La factura {number} está vencida" },
];

const ALERTS_RESTAURANTE: AlertRule[] = [
  { key: "insumo-critico", type: "STOCK_LOW", condition: "currentStock <= minStock AND isMenuInput", severity: "CRITICAL", title: "Insumo crítico para el menú del día", body: "El insumo {name} está agotado — afecta el menú del día" },
  { key: "plato-sin-costo", type: "KPI_ANOMALY", condition: "costPrice == 0 AND category != 'bebida'", severity: "WARNING", title: "Plato sin costo de receta", body: "El plato {name} no tiene costo de receta configurado" },
];

const ALERTS_CONSULTORA: AlertRule[] = [
  { key: "propuesta-sin-respuesta", type: "DEAL_STALE", condition: "stage=='propuesta' AND age(days) > 7", severity: "WARNING", title: "Propuesta sin respuesta >7 días", body: "La propuesta {title} no ha recibido respuesta en 7 días" },
  { key: "proyecto-sin-facturar", type: "INVOICE_OVERDUE", condition: "stage=='activo' AND noInvoiceThisMonth", severity: "WARNING", title: "Proyecto sin facturar este mes", body: "El proyecto {title} no tiene factura este mes" },
];

const ALERTS_RETAIL: AlertRule[] = [
  { key: "talla-agotada", type: "STOCK_LOW", condition: "currentStock <= minStock AND isStarProduct", severity: "CRITICAL", title: "Talla agotada en producto estrella", body: "La talla {variant} de {name} está agotada" },
  { key: "sell-through-bajo", type: "KPI_ANOMALY", condition: "sellThroughRate < 30 AND age(days) > 60", severity: "WARNING", title: "Sell-through <30% en 60 días", body: "El producto {name} tiene sell-through bajo" },
];

const ALERTS_CLINICA: AlertRule[] = [
  { key: "cita-sin-confirmar", type: "DEAL_STALE", condition: "stage=='cita-agendada' AND hoursUntilAppointment < 24", severity: "WARNING", title: "Cita sin confirmar 24h antes", body: "La cita de {contactName} no está confirmada y es en menos de 24h" },
  { key: "insumo-critico", type: "STOCK_LOW", condition: "currentStock <= minStock AND isMedicalInput", severity: "CRITICAL", title: "Insumo médico crítico en stock", body: "El insumo médico {name} está por debajo del mínimo" },
];

const ALERTS_PAPELERIA: AlertRule[] = [
  { key: "stock-bajo", type: "STOCK_LOW", condition: "currentStock <= minStock", severity: "WARNING", title: "Stock bajo mínimo", body: "El producto {name} tiene {currentStock} {unit} (mínimo: {minStock})" },
  { key: "pedido-sin-despachar", type: "ORDER_DELAYED", condition: "stage=='pedido' AND age(hours) > 48", severity: "WARNING", title: "Pedido sin despachar >48h", body: "El pedido {title} lleva más de 48h sin despachar" },
  { key: "descuento-temporada-escolar", type: "KPI_ANOMALY", condition: "season == 'escolar' AND stock == 0", severity: "WARNING", title: "Sin stock para temporada escolar", body: "Temporada escolar activa y {name} sin stock" },
];

const ALERTS_CARNICERIA: AlertRule[] = [
  { key: "stock-bajo", type: "STOCK_LOW", condition: "currentStock <= minStock", severity: "WARNING", title: "Stock bajo mínimo", body: "El producto {name} tiene {currentStock} {unit} (mínimo: {minStock})" },
  { key: "merma-alta", type: "KPI_ANOMALY", condition: "shrinkagePercent > 5", severity: "WARNING", title: "Merma alta del día", body: "La merma de {name} supera el 5% del día" },
  { key: "producto-perecedero-vencimiento", type: "ORDER_DELAYED", condition: "isPerishable AND expiryApproaching", severity: "CRITICAL", title: "Producto perecedero próximo a vencer", body: "El producto {name} vence en menos de 24h" },
];

// ============================================================================
// KPIs por nicho
// ============================================================================

const KPIS_FERRETERIA: KpiDefinition[] = [
  { key: "inventory_turnover", label: "Rotación de inventario", formula: "sum(sales) / avg(inventory)", unit: "x", dataSource: "movements" },
  { key: "margin_by_category", label: "Margen por categoría", formula: "(sum(salePrice) - sum(costPrice)) / sum(costPrice) * 100", unit: "%", dataSource: "products" },
  { key: "pending_orders", label: "Pedidos pendientes", formula: "count(deals WHERE stage IN ['cotizacion','pedido','despacho'])", unit: "", dataSource: "deals" },
  { key: "top_10_refs", label: "Top 10 referencias más vendidas", formula: "rank(products by sum(qty_sold))", unit: "", dataSource: "invoices" },
  { key: "days_of_stock", label: "Días de stock disponible", formula: "avg(currentStock / dailyAvgSales)", unit: "días", dataSource: "products" },
];

const KPIS_RESTAURANTE: KpiDefinition[] = [
  { key: "food_cost_pct", label: "Costo de materia prima (%)", formula: "sum(ingredientCost) / sum(sales) * 100", unit: "%", dataSource: "movements" },
  { key: "avg_ticket", label: "Ticket promedio por mesa", formula: "sum(invoices.total) / count(distinct invoice.tableNumber)", unit: "$", dataSource: "invoices" },
  { key: "top_platos", label: "Platos más vendidos", formula: "rank(products by sum(qty_sold))", unit: "", dataSource: "invoices" },
  { key: "table_turnover", label: "Rotación de mesas", formula: "count(invoices) / count(distinct tables)", unit: "x", dataSource: "invoices" },
  { key: "shrinkage_day", label: "Merma del día", formula: "sum(movementShrinkage) / sum(totalStock) * 100", unit: "%", dataSource: "movements" },
];

const KPIS_CONSULTORA: KpiDefinition[] = [
  { key: "mrr", label: "MRR (ingresos recurrentes)", formula: "sum(invoices.total WHERE type=='INVOICE' AND isRecurring)", unit: "$", dataSource: "invoices" },
  { key: "conversion_rate", label: "Tasa de conversión pipeline", formula: "count(deals.won) / count(deals) * 100", unit: "%", dataSource: "deals" },
  { key: "active_projects", label: "Proyectos activos", formula: "count(deals WHERE stage=='activo')", unit: "", dataSource: "deals" },
  { key: "billable_vs_worked", label: "Horas facturadas vs trabajadas", formula: "sum(billableHours) / sum(workedHours) * 100", unit: "%", dataSource: "invoices" },
  { key: "cac", label: "CAC", formula: "sum(marketingCosts) / count(newClients)", unit: "$", dataSource: "contacts" },
];

const KPIS_RETAIL: KpiDefinition[] = [
  { key: "sell_through", label: "Sell-through rate", formula: "units_sold / (units_sold + inventory) * 100", unit: "%", dataSource: "invoices" },
  { key: "inventory_by_season", label: "Inventario por temporada", formula: "sum(stock) GROUP BY season", unit: "", dataSource: "products" },
  { key: "avg_ticket", label: "Ticket promedio", formula: "sum(sales) / count(invoices)", unit: "$", dataSource: "invoices" },
  { key: "repeat_customers", label: "Clientes recurrentes (%)", formula: "count(contacts WHERE orders>=2) / count(contacts) * 100", unit: "%", dataSource: "contacts" },
  { key: "margin_by_category", label: "Margen por categoría", formula: "(sum(salePrice) - sum(costPrice)) / sum(costPrice) * 100", unit: "%", dataSource: "products" },
];

const KPIS_CLINICA: KpiDefinition[] = [
  { key: "appointments_per_day", label: "Citas por día", formula: "count(deals WHERE stage=='cita-agendada') GROUP BY date", unit: "", dataSource: "deals" },
  { key: "no_show_rate", label: "Tasa de no-show", formula: "count(citas no atendidas) / count(citas) * 100", unit: "%", dataSource: "deals" },
  { key: "revenue_by_doctor", label: "Ingresos por médico", formula: "sum(invoices.total) GROUP BY assignedTo", unit: "$", dataSource: "invoices" },
  { key: "top_inputs", label: "Insumos más usados", formula: "rank(products by sum(qty_used))", unit: "", dataSource: "movements" },
  { key: "new_vs_returning", label: "Pacientes nuevos vs recurrentes", formula: "count(new) / count(total) * 100", unit: "%", dataSource: "contacts" },
];

const KPIS_PAPELERIA: KpiDefinition[] = [
  { key: "inventory_turnover", label: "Rotación de inventario", formula: "sum(sales) / avg(inventory)", unit: "x", dataSource: "movements" },
  { key: "margin_by_category", label: "Margen por categoría (escolar/oficina)", formula: "(sum(salePrice) - sum(costPrice)) / sum(costPrice) * 100", unit: "%", dataSource: "products" },
  { key: "pending_orders", label: "Pedidos pendientes", formula: "count(deals WHERE stage IN ['cotizacion','pedido','despacho'])", unit: "", dataSource: "deals" },
  { key: "season_sales", label: "Ventas por temporada (escolar)", formula: "sum(invoices.total) GROUP BY season", unit: "$", dataSource: "invoices" },
  { key: "days_of_stock", label: "Días de stock disponible", formula: "avg(currentStock / dailyAvgSales)", unit: "días", dataSource: "products" },
];

const KPIS_CARNICERIA: KpiDefinition[] = [
  { key: "inventory_turnover", label: "Rotación de inventario (diaria)", formula: "sum(sales) / avg(inventory)", unit: "x", dataSource: "movements" },
  { key: "shrinkage_rate", label: "Tasa de merma", formula: "sum(shrinkage) / sum(totalStock) * 100", unit: "%", dataSource: "movements" },
  { key: "yield_per_cut", label: "Rendimiento por corte (desposte)", formula: "sum(outputWeight) / sum(inputWeight) * 100", unit: "%", dataSource: "movements" },
  { key: "margin_by_category", label: "Margen por tipo de carne", formula: "(sum(salePrice) - sum(costPrice)) / sum(costPrice) * 100", unit: "%", dataSource: "products" },
  { key: "waste_cost", label: "Costo de merma del día", formula: "sum(shrinkageQty * unitCost)", unit: "$", dataSource: "movements" },
];

// ============================================================================
// PRODUCT FIELDS por nicho
// ============================================================================

const FIELDS_FERRETERIA: FieldConfig[] = [
  { key: "sku", label: "Referencia", type: "text", required: true, placeholder: "REF-001" },
  { key: "unit", label: "Unidad", type: "select", required: true, options: ["und", "mt", "kg", "lt", "caja", "paquete"] },
  { key: "salePrice", label: "Precio mayorista", type: "number", required: false },
  { key: "minStock", label: "Stock mínimo", type: "number", required: false },
  { key: "warehouseLocation", label: "Ubicación bodega", type: "text", required: false, placeholder: "Estante A-3" },
  { key: "supplier", label: "Proveedor", type: "text", required: false },
];

const FIELDS_RESTAURANTE: FieldConfig[] = [
  { key: "name", label: "Nombre del plato/insumo", type: "text", required: true },
  { key: "category", label: "Categoría", type: "select", required: true, options: ["cocina", "bebida", "postre", "insumo"] },
  { key: "recipeCost", label: "Costo receta", type: "number", required: false },
  { key: "salePrice", label: "Precio de venta", type: "number", required: true },
  { key: "unit", label: "Unidad", type: "select", required: true, options: ["porción", "lt", "gr", "ml"] },
  { key: "supplier", label: "Proveedor", type: "text", required: false },
];

const FIELDS_CONSULTORA: FieldConfig[] = [
  { key: "name", label: "Nombre del servicio", type: "text", required: true },
  { key: "type", label: "Tipo", type: "select", required: true, options: ["puntual", "recurrente"] },
  { key: "hourlyRate", label: "Precio por hora", type: "number", required: false },
  { key: "fixedPrice", label: "Precio fijo", type: "number", required: false },
  { key: "estimatedHours", label: "Horas estimadas", type: "number", required: false },
  { key: "deliverables", label: "Entregables", type: "textarea", required: false },
];

const FIELDS_RETAIL: FieldConfig[] = [
  { key: "sku", label: "SKU", type: "text", required: true, placeholder: "PRENDA-001" },
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "category", label: "Categoría", type: "text", required: true },
  { key: "size", label: "Talla", type: "select", required: true, options: ["XS", "S", "M", "L", "XL", "XXL", "única"] },
  { key: "color", label: "Color", type: "text", required: false },
  { key: "season", label: "Temporada", type: "select", required: false, options: ["primavera", "verano", "otoño", "invierno", "escolar"] },
  { key: "supplier", label: "Proveedor", type: "text", required: false },
];

const FIELDS_CLINICA: FieldConfig[] = [
  { key: "name", label: "Nombre del servicio médico", type: "text", required: true },
  { key: "type", label: "Tipo", type: "select", required: true, options: ["consulta", "procedimiento", "examen"] },
  { key: "duration", label: "Duración (minutos)", type: "number", required: true },
  { key: "price", label: "Precio", type: "number", required: true },
  { key: "cups_code", label: "Código CUPS (Colombia)", type: "text", required: false, placeholder: "890101" },
  { key: "requires_inputs", label: "Requiere insumos", type: "boolean", required: false },
];

const FIELDS_PAPELERIA: FieldConfig[] = [
  { key: "sku", label: "Referencia", type: "text", required: true, placeholder: "PAP-001" },
  { key: "name", label: "Nombre", type: "text", required: true },
  { key: "category", label: "Categoría", type: "select", required: true, options: ["escolar", "oficina", "arte", "reventa", "desechable", "otro"] },
  { key: "unit", label: "Unidad", type: "select", required: true, options: ["und", "paquete", "caja", "docena"] },
  { key: "salePrice", label: "Precio venta", type: "number", required: true },
  { key: "minStock", label: "Stock mínimo", type: "number", required: false },
  { key: "warehouseLocation", label: "Ubicación", type: "text", required: false, placeholder: "Estante B-2" },
  { key: "supplier", label: "Proveedor", type: "text", required: false },
];

const FIELDS_CARNICERIA: FieldConfig[] = [
  { key: "name", label: "Nombre del corte", type: "text", required: true, placeholder: "Lomo de res" },
  { key: "category", label: "Tipo de carne", type: "select", required: true, options: ["res", "cerdo", "pollo", "cordero", "embutido", "insumo"] },
  { key: "unit", label: "Unidad", type: "select", required: true, options: ["kg", "g", "lb"] },
  { key: "salePrice", label: "Precio por kg", type: "number", required: true },
  { key: "costPrice", label: "Costo por kg (en canal)", type: "number", required: false },
  { key: "minStock", label: "Stock mínimo (kg)", type: "number", required: false },
  { key: "yieldPct", label: "Rendimiento (%)", type: "number", required: false, placeholder: "75.5 — % de aprovechamiento tras desposte" },
  { key: "isPerishable", label: "Perecedero", type: "boolean", required: false },
  { key: "supplier", label: "Proveedor (finca/frigorífico)", type: "text", required: false },
];

// ============================================================================
// NAV ITEMS modulares
// ============================================================================

function navWithSchedule(): NavItem[] {
  return [
    ...BASE_NAV,
    { label: "Agenda de citas", href: "/dashboard/scheduling", icon: "Calendar", enabled: true },
  ];
}

function navWithProjects(): NavItem[] {
  return [
    ...BASE_NAV,
    { label: "Proyectos", href: "/dashboard/projects", icon: "FolderKanban", enabled: true },
  ];
}

// ============================================================================
// PLANTILLAS
// ============================================================================

export const TEMPLATES: Record<Industry, NicheTemplate> = {
  // -----------------------------------------------------------------
  FERRETERIA: {
    id: "ferreteria",
    name: "Ferretería / Distribuidora",
    industry: "FERRETERIA",
    description: "Inventario pesado, proveedores, pedidos y facturación B2B",
    vocabulary: { product: "Referencia", client: "Comprador", deal: "Pedido", invoice: "Factura" },
    modules: { ...BASE_MODULES },
    productFields: FIELDS_FERRETERIA,
    pipelineStages: PIPELINE_FERRETERIA,
    kpis: KPIS_FERRETERIA,
    alertRules: ALERTS_FERRETERIA,
    navItems: BASE_NAV,
    sampleCategories: ["Herramientas manuales", "Herramientas eléctricas", "Tornillería", "Plomería", "Electricidad", "Pinturas", "Ferretería general", "Adhesivos"],
  },

  // -----------------------------------------------------------------
  RESTAURANTE: {
    id: "restaurante",
    name: "Restaurante / Cafetería",
    industry: "RESTAURANTE",
    description: "Inventario de insumos, control de mermas, facturación por mesa y turnos",
    vocabulary: { product: "Plato/Insumo", client: "Comensal", deal: "Mesa", invoice: "Cuenta" },
    modules: { ...BASE_MODULES, scheduling: true },
    productFields: FIELDS_RESTAURANTE,
    pipelineStages: PIPELINE_RESTAURANTE,
    kpis: KPIS_RESTAURANTE,
    alertRules: ALERTS_RESTAURANTE,
    navItems: navWithSchedule(),
    sampleCategories: ["Cocina caliente", "Cocina fría", "Bebidas", "Postres", "Insumos", "Lácteos", "Carnes", "Verduras"],
  },

  // -----------------------------------------------------------------
  CONSULTORA: {
    id: "consultora",
    name: "Consultora / Agencia de servicios",
    industry: "CONSULTORA",
    description: "CRM pesado, gestión de proyectos, facturación por horas y KPIs de pipeline",
    vocabulary: { product: "Servicio", client: "Cliente", deal: "Proyecto", invoice: "Propuesta" },
    modules: { ...BASE_MODULES, projects: true, inventory: false },
    productFields: FIELDS_CONSULTORA,
    pipelineStages: PIPELINE_CONSULTORA,
    kpis: KPIS_CONSULTORA,
    alertRules: ALERTS_CONSULTORA,
    navItems: navWithProjects(),
    sampleCategories: ["Consultoría estrategia", "Desarrollo", "Diseño", "Marketing digital", "Legal", "Contable", "Auditoría"],
  },

  // -----------------------------------------------------------------
  RETAIL: {
    id: "retail",
    name: "Tienda de ropa / Retail",
    industry: "RETAIL",
    description: "Inventario por tallas/colores, POS, análisis de temporadas y CRM de compradores",
    vocabulary: { product: "Prenda", client: "Cliente", deal: "Venta", invoice: "Factura" },
    modules: { ...BASE_MODULES },
    productFields: FIELDS_RETAIL,
    pipelineStages: PIPELINE_RETAIL,
    kpis: KPIS_RETAIL,
    alertRules: ALERTS_RETAIL,
    navItems: BASE_NAV,
    sampleCategories: ["Camisas", "Pantalones", "Vestidos", "Calzado", "Accesorios", "Ropa interior", "Abrigos", "Deportivo"],
  },

  // -----------------------------------------------------------------
  CLINICA: {
    id: "clinica",
    name: "Clínica / Consultorio médico",
    industry: "CLINICA",
    description: "Agenda de citas, historial de pacientes, facturación de servicios e insumos médicos",
    vocabulary: { product: "Servicio médico", client: "Paciente", deal: "Cita", invoice: "Recibo" },
    modules: { ...BASE_MODULES, scheduling: true },
    productFields: FIELDS_CLINICA,
    pipelineStages: PIPELINE_CLINICA,
    kpis: KPIS_CLINICA,
    alertRules: ALERTS_CLINICA,
    navItems: navWithSchedule(),
    sampleCategories: ["Medicina general", "Odontología", "Dermatología", "Pediatría", "Laboratorio", "Insumos médicos", "Procedimientos"],
  },

  // -----------------------------------------------------------------
  PAPELERIA: {
    id: "papeleria",
    name: "Papelería",
    industry: "PAPELERIA",
    description: "Inventario mixto escolar/oficina, ventas por mostrador y control de temporadas escolares",
    vocabulary: { product: "Producto", client: "Cliente", deal: "Pedido", invoice: "Factura" },
    modules: { ...BASE_MODULES },
    productFields: FIELDS_PAPELERIA,
    pipelineStages: PIPELINE_PAPELERIA,
    kpis: KPIS_PAPELERIA,
    alertRules: ALERTS_PAPELERIA,
    navItems: BASE_NAV,
    sampleCategories: ["Escolar", "Oficina", "Arte", "Computación", "Desechables", "Reventa", "Tintas", "Cuadernos"],
  },

  // -----------------------------------------------------------------
  CARNICERIA: {
    id: "carniceria",
    name: "Carnicería",
    industry: "CARNICERIA",
    description: "Inventario perecedero, control de mermas, corte/desposte y trazabilidad",
    vocabulary: { product: "Corte", client: "Cliente", deal: "Pedido", invoice: "Factura" },
    modules: { ...BASE_MODULES },
    productFields: FIELDS_CARNICERIA,
    pipelineStages: PIPELINE_CARNICERIA,
    kpis: KPIS_CARNICERIA,
    alertRules: ALERTS_CARNICERIA,
    navItems: BASE_NAV,
    sampleCategories: ["Res", "Cerdo", "Pollo", "Cordero", "Embutidos", "Insumos", "Marinados", "Precocidos"],
  },
};

// ============================================================================
// TEMPLATE FACTORY
// ============================================================================

export class TemplateFactory {
  private static cache = new Map<Industry, NicheTemplate>();

  static create(industry: Industry): NicheTemplate {
    if (this.cache.has(industry)) {
      return this.cache.get(industry)!;
    }
    const template = TEMPLATES[industry];
    if (!template) {
      throw new Error(`No template found for industry: ${industry}`);
    }
    this.cache.set(industry, template);
    return template;
  }

  static getAll(): NicheTemplate[] {
    return Object.values(TEMPLATES);
  }

  static getById(id: string): NicheTemplate | undefined {
    return Object.values(TEMPLATES).find((t) => t.id === id);
  }

  static getIndustries(): { id: string; name: string; description: string }[] {
    return Object.values(TEMPLATES).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
    }));
  }
}
