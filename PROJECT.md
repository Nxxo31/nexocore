# NexoCore — Plataforma SaaS Multi-Tenant ERP/CRM/Analytics para PYMEs
**Versión:** 2026.08.09 | **Sprint:** 1 (Semana 1) — Base y plantillas
**Estado:** EN PROGRESO · Sprint 1 completo, Sprints 2-4 planificados

## Resumen

Plataforma SaaS multi-tenant donde cada empresa (tenant) accede a un workspace
configurado con una PLANTILLA DE NICHO que pre-configura módulos activos,
campos de inventario, KPIs, pipeline CRM, formularios y terminología de UI.

Stack: Next.js 15 App Router · TypeScript · PostgreSQL · Prisma ORM
       Node.js · Stripe · Resend · BullMQ · Redis · shadcn/ui · Tailwind

## Plantillas de Nicho (7)

1. **Ferretería / Distribuidora** — Inventario pesado, proveedores, pedidos
2. **Restaurante / Cafetería** — Inventario de insumos, mesas, mermas
3. **Consultora / Agencia** — CRM pesado, proyectos, facturación por horas
4. **Tienda de ropa / Retail** — Variantes talla/color, POS, temporadas
5. **Clínica / Consultorio médico** — Agenda de citas, historial pacientes
6. **Papelería** — Inventario mixto, ventas por mostrador, escolar/oficina
7. **Carnicería** — Inventario perecedero, corte/desposte, control de mermas

## Arquitectura Multi-Tenant: Hybrid Pool/Silo

- Fase MVP: Pool (shared PostgreSQL, tenant_id en cada tabla, RLS)
- Fase escala: Hybrid (Starter/Pro → Pool, Enterprise → Silo dedicada)
- Identificación: subdominio + JWT claim

## Matriz de Requisitos (R-XX)

Cada requisito tiene un ID único (R-XX), descripción verificable, y estado observable.

| ID | Requisito | Verificación | Estado |
|----|-----------|--------------|--------|
| R-01 | Setup Next.js 15 + Prisma + TypeScript | `npx next build` exit 0 | ✅ Done |
| R-02 | schema.prisma completo (todas las tablas multi-tenant) | `npx prisma validate` exit 0 | ✅ Done |
| R-03 | 7 plantillas de nicho en Template Factory | `grep -r "templateId" src/modules/templates/` 7 IDs | ✅ Done |
| R-04 | NextAuth v5 multi-tenant con tenant_id en JWT | Login devuelve JWT con `tenant_id` claim | ✅ Done |
| R-05 | Middleware multi-tenant (subdominio + JWT) | Petición sin JWT → redirect /login | ✅ Done |
| R-06 | Onboarding con selector de nicho | Flujo crea tenant + aplica plantilla | ✅ Done |
| R-07 | Layout dashboard con sidebar dinámico según plantilla | Sidebar cambia según `templateId` | ✅ Done |
| R-08 | Repository Pattern con tenant isolation automático | Todo repository recibe `tenantId`, query filter | ✅ Done |
| R-09 | RLS PostgreSQL por tenant_id | `SET app.tenant_id` → query ajenos retorna 0 filas | ✅ Done |
| R-10 | Módulo Inventario: productos, proveedores, movimientos | CRUD completo + listado paginado | ✅ Done |
| R-11 | Módulo CRM: pipeline, contacts, deals | Sprint 2 | ⏳ Pendiente |
| R-12 | Módulo Analytics: dashboard KPIs por plantilla | Sprint 3 | ⏳ Pendiente |
| R-13 | Stripe billing (suscripciones, webhooks) | Sprint 4 | ⏳ Pendiente |
| R-14 | BullMQ background jobs (reportes, emails) | Sprint 2-4 | ⏳ Pendiente |
| R-15 | Resend email transaccional (onboarding, alerts) | Sprint 2 | ⏳ Pendiente |
| R-16 | Plantilla override por usuario (custom fields) | Sprint 3 | ⏳ Pendiente |
| R-17 | API rate limiting por plan (Starter/Pro/Enterprise) | Sprint 4 | ⏳ Pendiente |
| R-18 | Auditoría: log de acciones por tenant | Sprint 3 | ⏳ Pendiente |
| R-19 | Exportación CSV/Excel de módulos | Sprint 3 | ⏳ Pendiente |
| R-20 | Search global (productos, contacts, deals) | Sprint 4 | ⏳ Pendiente |

## Roadmap

### Sprint 1 — Base y plantillas (SEMANA 1) ✅ Completado
- [x] Setup Next.js 15 + Prisma + TypeScript (R-01)
- [x] schema.prisma completo multi-tenant (R-02)
- [x] 7 plantillas de nicho (R-03)
- [x] NextAuth v5 multi-tenant (R-04)
- [x] Middleware multi-tenant (R-05)
- [x] Onboarding con selector de nicho (R-06)
- [x] Layout dashboard con sidebar dinámico (R-07)
- [x] Repository Pattern con tenant isolation (R-08)
- [x] RLS PostgreSQL (R-09)
- [x] Módulo Inventario base (R-10)

### Sprint 2 — CRM + Email + Jobs iniciales (SEMANA 2)
- [ ] Módulo CRM: pipeline visual, contacts, deals (R-11)
- [ ] Resend: email onboarding + notificaciones (R-15)
- [ ] BullMQ: job de bienvenida + reporte diario (R-14 parcial)
- [ ] Dashboard por plantilla: arrastrar campos CRM

### Sprint 3 — Analytics + Templates avanzadas (SEMANA 3)
- [ ] Módulo Analytics: KPIs dinámicos por plantilla (R-12)
- [ ] Plantilla override: custom fields por usuario (R-16)
- [ ] Auditoría: log de acciones por tenant (R-18)
- [ ] Exportación CSV/Excel (R-19)

### Sprint 4 — Billing + Search + Scale (SEMANA 4)
- [ ] Stripe billing: suscripciones, webhooks, portal cliente (R-13)
- [ ] Search global con tenant_id filter (R-20)
- [ ] API rate limiting por plan (R-17)
- [ ] BullMQ: jobs pesados (reportes masivos) (R-14 completo)
- [ ] Preparar soporte Hybrid Pool/Silo (Enterprise Silo)

## Definition of Done (DoD) — Estado Observable

Un entregable está Done si TODAS estas condiciones son verdaderas y verificables:

1. **Compila:** `npx next build` retorna exit code 0
2. **Sin errores LSP:** `mcp__lsp_intelligence__live_diagnostics` reporta 0 errores
3. **Schema válido:** Si se modificó schema.prisma → `npx prisma validate` exit 0 + `prisma generate` ejecutado
4. **Tenant isolation:** Toda query Prisma incluye `where: { tenantId }` — verificable con grep
5. **Sin secrets:** `gitleaks detect --staged` retorna 0 findings
6. **Code review:** `delegate_task` con skill `code-review-and-quality` → passed
7. **PROJECT.md actualizado:** Requisito R-XX marcado ✅ Done con verificación real
8. **Commit atómico:** Mensaje en español, scope único, sin archivos no relacionados
9. **Push exitoso:** Cambios subidos a `github.com/Nxxo31/nexocore` sin conflictos

El DoD es un ESTADO, no una opinión. Si no puedes demostrarlo con un comando, no está Done.

## Decisiones Técnicas (Justificadas)

1. **Server Components por defecto** → Mejor FCP/SEO, menos JS enviado al cliente. Client Components solo donde hay interactividad (onClick, useState, useEffect).
2. **Zod para validación en ambos lados** → Un solo schema source-of-truth. Tipos TypeScript infieren desde Zod, evitando drift entre cliente/servidor.
3. **Paginación cursor-based** → OFFSET tiene O(n) en PostgreSQL a escala. Cursor usa WHERE + ORDER BY index → O(log n).
4. **tenant_id NUNCA en URLs públicas** → Previne IDOR (accès cross-tenant via URL). tenant_id viene siempre del JWT validado server-side.
5. **Repository Pattern con tenant isolation automático** → Capa de abstraction evita que un desarrollador olvide el `where: { tenantId }`. Repository recibe tenantId del contexto de sesión.
6. **RLS PostgreSQL como defense-in-depth** → Si el código falla (query sin tenant_id), RLS en DB bloquea el acceso. Una capa de seguridad no es suficiente.
7. **Pool mode para MVP** → Un solo DB reduce costos y complejidad operacional. Silo dedicado se añade en Sprint 4-escala solo para Enterprise.
8. **SearchParams Promise en NextAuth v5** → Next.js 15 hace `searchParams` asíncrono. Olvidar `await searchParams` causa el error más común de App Router.

## Out-of-Scope (Explícito)

- **Mobile app nativa** — Web responsive por ahora. PWA evaluación en post-MVP.
- **Multi-idioma (i18n)** — Solo español para MVP. En Sprints 2 se evalúa next-intl si hay demanda.
- **API pública con documentación OpenAPI** — Endpoint privado solo. API pública post-MVP.
- **Importación masiva desde Excel legacy** — Solo CSV/Excel exportación. Importación evaluada caso por caso.
- **POS hardware offline** — Solo web sesión. POS nativo con impresora thermal post-MVP.
- **WhatsApp/Telegram integration** — Evaluar Twilio post-MVP.
- **SSO empresarial (SAML/OIDC)** — NextAuth entrañas soportado pero no configurado. Enterprise tier post-MVP.
- **Dashboard builder drag-and-drop** — Vista pre-configurada por plantilla. Builder custom post-MVP.

## Limitaciones Conocidas

- Sprint 1 no incluye STRIPE (va en Sprint 4)
- Sprint 1 no incluye BullMQ jobs (van en Sprint 2-4)
- El template override por usuario no está implementado aún (template base solo)

## Traza

| Fecha | Sesión | Cambio |
|-------|--------|--------|
| 2026-08-07 | Sprint 1 kickoff | Setup proyecto, schema, plantillas, auth, middleware, onboarding, layout |
| 2026-08-09 | Sprint 1 review | PROJECT.md mejorado (matriz R-XX, roadmap 2-4, DoD, out-of-scope, decisiones) + commit pendientes |
