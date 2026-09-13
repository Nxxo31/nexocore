# NexoCore — Plataforma SaaS Multi-Tenant ERP/CRM/Analytics para PYMEs
**Versión:** 2026.09.13 | **Sprint:** 2 parcial (UI inventory + workers reales)
**Estado:** Alpha · Sprint 1+2 parcial completo (verificado 2026-09-13), Sprints 3-4 planificados

## Resumen

Plataforma SaaS multi-tenant donde cada empresa (tenant) accede a un workspace
configurado con una PLANTILLA DE NICHO que pre-configura módulos activos,
campos de inventario, KPIs, pipeline CRM, formularios y terminología de UI.

Stack: Next.js 16 App Router · TypeScript 5 · PostgreSQL · Prisma ORM
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

## Matriz de Requisitos (R-XX) — ESTADO REAL 2026-09-12

Cada requisito tiene un ID único (R-XX), descripción verificable, y estado observable.

| ID | Requisito | Verificación | Estado |
|----|-----------|--------------|--------|
| R-01 | Setup Next.js 16 + Prisma + TypeScript | `npm run build` (MOCK_REDIS=true) exit 0 | ✅ Done |
| R-02 | schema.prisma completo (todas las tablas multi-tenant) | `npx prisma validate` exit 0 (con DATABASE_URL) | ✅ Done |
| R-03 | 7 plantillas de nicho en Template Factory | 7 entries en `TEMPLATES` (templates.ts:260-372) | ✅ Done |
| R-04 | NextAuth v5 multi-tenant con tenant_id en JWT + bcrypt verify + IDOR fix + maxAge 8h | `authorize()` bcrypt.compare + tenant-switch ownership check + session.maxAge 8*60*60 | ✅ Done |
| R-05 | Middleware multi-tenant (subdominio + JWT) | Petición sin JWT → redirect `/login?callbackUrl=` | ✅ Done |
| R-06 | Onboarding con selector de nicho | Flujo crea tenant + aplica plantilla | ✅ Done |
| R-07 | Layout dashboard con sidebar dinámico según plantilla | Sidebar cambia según `getTenantSession().industry` | ✅ Done |
| R-08 | Repository Pattern con tenant isolation automático | Todo repository filtra `where:{tenantId}` en CRUD | ✅ Done |
| R-09 | RLS PostgreSQL por tenant_id | `ENABLE ROW LEVEL SECURITY` + policies per-table | ✅ Done |
| R-10 | Módulo Inventario: productos, proveedores, movimientos | CRUD + 3 UI pages (`/inventory`, `/inventory/movements`, `/inventory/suppliers`) | ✅ Done |
| R-11 | Módulo CRM: pipeline, contacts, deals | Repos + APIs + UI básica (`/crm`, `/crm/contacts`) | ✅ Done |
| R-12 | Módulo Analytics: dashboard KPIs por plantilla | Sprint 3 | ⏳ Pendiente |
| R-13 | Stripe billing (suscripciones, webhooks) | Sprint 4 | ⏳ Pendiente |
| R-14 | BullMQ background jobs (reportes, emails) | email + invoice + data-export workers reales (consumer.ts) | ✅ Done |
| R-15 | Resend email transaccional (onboarding, alerts) | EmailService con 6 templates + producer/consumer + URLs reales | ✅ Done |
| R-16 | Plantilla override por usuario (custom fields) | Sprint 3 | ⏳ Pendiente |
| R-17 | API rate limiting por plan (Starter/Pro/Enterprise) | Sprint 4 | ⏳ Pendiente |
| R-18 | Auditoría: log de acciones por tenant | Servicio `audit.service.ts` + tabla AuditLog + RLS + wired en `/api/contacts/export` + `/api/deals/export` + workers | ✅ Done |
| R-19 | Exportación CSV/Excel de módulos | API `/api/contacts/export` (CSV) + `/api/deals/export` (XLSX) con audit + take:10000 | ✅ Done |
| R-20 | Search global (productos, contacts, deals) | Sprint 4 | ⏳ Pendiente |

## Cambios recientes (2026-09-11 → 2026-09-13 — cierre Sprint 1+2 parcial)

### Sprint 1 (2026-09-11)
- `chore(cleanup): eliminar archivos .ts/.backup/.bak2 obsoletos de useWorkspace` (8081cf2)
- `chore(deps): añadir dependencias faltantes (@dnd-kit/utilities, @valkey/valkey-glide, bcryptjs)` (a2fa830)
- `fix(auth): implementar verificación real de bcrypt en authorize` (6160370) — **CRÍTICO**: cierra backdoor de auth abierto
- `fix(dashboard): resolver TODOs multi-tenant — industry viene del JWT` (ef75c7c)
- `chore(higiene): limpiar .gitignore y eliminar archivos de tooling stale` (7ee42f5)
- `chore(prisma): generar baseline migration init para schema multi-tenant` (da90bb5)
- `docs(nexocore): actualizar PROJECT.md al cierre Sprint 1` (655ca76)
- `fix(scripts): migrar next lint a eslint directo` (5b92f40) — Next 16 removió `next lint`
- `fix(middleware): redirigir a /login cuando no hay sesión en /dashboard y /api` (db9b07c)

### Post-auditoría (2026-09-12) — cierre de brechas críticas
- `fix(security): aplicar tenant isolation a repos CRM/inventory, validar sesión en jobs y activar RLS PostgreSQL` (01ab6f2)
  - **Bug crítico R-08**: `product.repository.ts` y CRM repos (`contact`, `deal`, `pipeline`, `activity`) exponían `update` sin `where:{tenantId}`. Cross-tenant writes posibles con solo conocer el id. CERRADO.
  - **Bug crítico /api/jobs/invoice-generate**: handler leía `tenantId` del body sin validar sesión (queue injection cross-tenant). CERRADO con `getTenantSession()`.
  - **R-09 cumplido**: migration `20260102000000_enable_rls` activa RLS en 16 tablas tenant-scoped + policies + helpers SQL (`current_tenant_id()`).
  - **R-10 cumplido**: `movement.repository.ts` y `supplier.repository.ts` implementados (estaban vacíos).
  - **Limpieza**: 4 archivos de test olvidados en `src/shared/hooks/` eliminados.
  - **Sidebar honesty**: rutas que no existen (inventory, invoicing, analytics, settings, scheduling, projects) marcadas `enabled=false` para no mostrar links 404.
  - **Session.ts hardened**: el fallback demo-tenant ahora requiere `NEXOCORE_DEV_FALLBACK=1` en dev. En producción lanza error explícito.
- `fix(auth): verificar ownership antes de cambiar tenantId en session update` (293a7ad) — IDOR fix en tenant-switch callback.
- `fix(auth): session.maxAge 8h explícito en NextAuth config` (f095b41) — JWT deja de ser 30d por default.
- `docs(env): añadir REDIS_HOST/PORT/PASSWORD/DB separados` (a3686f3) — queue.setup.ts y consumer.ts los esperan.
- `fix(email): nexocore.app→.co default domain + URLs reales en templates` (b3ba2f7) — welcome/invoice emails ya tienen loginUrl/invoiceUrl.

### Sprint 2 parcial (2026-09-13)
- `feat(inventory): habilitar nav items Inventario/Movimientos/Proveedores` (557fbd1) — base.template.ts pasa enabled=true.
- `feat(jobs): implementar workers reales invoice-generation y data-export` (93de50c) — TODOs eliminados en consumer.ts.
- `feat(inventory): UI pages para productos, movimientos, proveedores` (086eaa1) — 3 Server Components con cursor pagination + low-stock badge + search.

## Roadmap

### Sprint 1 — Base y plantillas (SEMANA 1) ✅ Completado (verificado 2026-09-12)
- [x] Setup Next.js 16 + Prisma + TypeScript (R-01)
- [x] schema.prisma completo multi-tenant (R-02)
- [x] 7 plantillas de nicho (R-03)
- [x] NextAuth v5 multi-tenant (R-04) — incluye bcrypt real + IDOR fix + maxAge 8h
- [x] Middleware multi-tenant (R-05)
- [x] Onboarding con selector de nicho (R-06)
- [x] Layout dashboard con sidebar dinámico (R-07)
- [x] Repository Pattern con tenant isolation (R-08)
- [x] RLS PostgreSQL (R-09) — activado en migration 20260102000000
- [x] Módulo Inventario base (R-10) — CRUD + UI ✅
- [x] Módulo CRM (R-11) — bonus

### Sprint 2 — Email + Jobs + UI Inventory (SEMANA 2) ✅ Parcial (2026-09-13)
- [x] Implementar páginas UI: `/inventory`, `/inventory/movements`, `/inventory/suppliers` (086eaa1)
- [x] Implementar `invoice-generation` worker real (93de50c)
- [x] Implementar `data-export` worker real (93de50c)
- [ ] BullMQ: job de bienvenida + reporte diario — `welcome-email` ya existe (EmailJobProducer), falta scheduled daily report
- [x] Wire de `audit.service.ts` en export routes + workers — R-18 parcial ✅ (workers + contacts/deals export usan AuditService)

### Sprint 3 — Analytics + Templates avanzadas (SEMANA 3)
- [ ] Módulo Analytics: KPIs dinámicos por plantilla (R-12)
- [ ] Plantilla override: custom fields por usuario (R-16)
- [ ] Auditoría: log de acciones por tenant — cobertura completa (R-18)
- [ ] Exportación CSV/Excel streaming (R-19)

### Sprint 4 — Billing + Search + Scale (SEMANA 4)
- [ ] Stripe billing: suscripciones, webhooks, portal cliente (R-13)
- [ ] Search global con tenant_id filter (R-20)
- [ ] API rate limiting por plan (R-17)
- [ ] BullMQ: jobs pesados (reportes masivos) (R-14 completo)
- [ ] Preparar soporte Hybrid Pool/Silo (Enterprise Silo)

## Definition of Done (DoD) — Estado Observable

Un entregable está Done si TODAS estas condiciones son verdaderas y verificables:

1. **Compila:** `npm run build` retorna exit code 0 (con `MOCK_REDIS=true` en dev sin Redis)
2. **Sin errores de tipos:** `npx tsc --noEmit` reporta 0 errores
3. **Schema válido:** Si se modificó schema.prisma → `npx prisma validate` exit 0 + `npx prisma generate` ejecutado
4. **Tenant isolation:** Toda query Prisma incluye `where: { tenantId }` — verificable con grep
5. **Sin secrets:** `gitleaks detect --staged` retorna 0 findings
6. **PROJECT.md actualizado:** Requisito R-XX marcado ✅ Done con verificación real
7. **Commit atómico:** Mensaje en español, scope único, sin archivos no relacionados
8. **Push exitoso:** Cambios subidos a `github.com/Nxxo31/nexocore` sin conflictos

El DoD es un ESTADO, no una opinión. Si no puedes demostrarlo con un comando, no está Done.

## Decisiones Técnicas (Justificadas)

1. **Server Components por defecto** → Mejor FCP/SEO, menos JS enviado al cliente. Client Components solo donde hay interactividad (onClick, useState, useEffect).
2. **Zod para validación en ambos lados** → Un solo schema source-of-truth. Tipos TypeScript infieren desde Zod, evitando drift entre cliente/servidor.
3. **Paginación cursor-based** → OFFSET tiene O(n) en PostgreSQL a escala. Cursor usa WHERE + ORDER BY index → O(log n).
4. **tenant_id NUNCA en URLs públicas** → Previne IDOR (accès cross-tenant via URL). tenant_id viene siempre del JWT validado server-side.
5. **Repository Pattern con tenant isolation automático** → Capa de abstraction evita que un desarrollador olvide el `where: { tenantId }`. Repository recibe tenantId del contexto de sesión.
6. **RLS PostgreSQL como defense-in-depth** → Si el código falla (query sin tenant_id), RLS en DB bloquea el acceso. Una capa de seguridad no es suficiente.
7. **Pool mode para MVP** → Un solo DB reduce costos y complejidad operacional. Silo dedicado se añade en Sprint 4-escala solo para Enterprise.
8. **searchParams Promise en NextAuth v5** → Next.js 16 hace `searchParams` asíncrono. Olvidar `await searchParams` causa el error más común de App Router.
9. **MOCK_REDIS en dev** → Permite `next build` sin instancia Redis corriendo. Variable `MOCK_REDIS=true` activa `MockQueue` en `queue.setup.ts`.
10. **bcryptjs (no bcrypt)** → Pure-JS, evita C++ workload / node-gyp. API idéntica.

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
- BullMQ workers de `invoice-generation` y `data-export` son TODOs (sólo log); email worker está completo
- Templates override por usuario no implementado aún (template base solo)
- Sidebar muestra únicamente rutas implementadas (`/dashboard`, `/crm`, `/crm/contacts`); las demás están marcadas `enabled=false` hasta que se implementen las páginas
- `/api/contacts/export` y `/api/deals/export` usan `take:10000` sin streaming — sólo OK para datasets pequeños
- `JWT maxAge` no está configurado explícitamente — NextAuth v5 default = 30 días

## Hallazgos pendientes (post-auditoría 2026-09-12)

### Seguridad
- ✅ R-08 tenant isolation en repositorios: cerrado en `01ab6f2`
- ✅ R-09 RLS PostgreSQL: cerrado en `01ab6f2`
- ✅ `/api/jobs/invoice-generate` IDOR: cerrado en `01ab6f2`
- ✅ `session.ts` fallback demo-tenant en producción: cerrado en `01ab6f2`
- ✅ `auth.config.ts:82-92` callback "update" cambia `token.tenantId` al `session.tenantId` del cliente sin verificar ownership → potencial IDOR. CERRADO en `<commit-hash>`: lookup `prisma.workspaceUser.findUnique({where:{workspaceId_userId:{workspaceId,userId:token.uid}}})` antes de aplicar el switch; si el usuario no es miembro del workspace solicitado, el token actual se preserva y se loguea warning. Bonus: índice `@@unique([workspaceId,userId])` ya existía en schema, query O(log n).
- ⏳ `auth.config.ts` `session.maxAge` no configurado (default 30 días) → JWT sin maxAge explícito. Recomendado: 8h + refresh token.
- ⏳ `tenant.prisma.ts` (87 líneas) — middleware Prisma que NADIE importa. Código muerto peligroso.
- ⏳ `/api/contacts/export` y `/api/deals/export` con `take:10000` sin rate limit ni streaming.

### Higiene
- ⏳ `.env.example` incompleto: faltan `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD`, `REDIS_DB`. Añadir en próximo commit.
- ⏳ Email service fallback usa `'nexocore.app'` pero `.env.example` dice `'nexocore.co'` (línea 14 de `email.service.ts`).
- ⏳ Welcome/invoice email templates tienen `href="#"` (placeholders muertos).

### UI
- ⏳ Faltan 7+ páginas UI que el sidebar promete (inventory, invoicing, analytics, settings, scheduling, projects). Marcadas `enabled=false` por ahora.

## Traza

| Fecha | Sesión | Cambio |
|-------|--------|--------|
| 2026-08-07 | Sprint 1 kickoff | Setup proyecto, schema, plantillas, auth, middleware, onboarding, layout |
| 2026-08-09 | Sprint 1 review | PROJECT.md mejorado (matriz R-XX, roadmap 2-4, DoD, out-of-scope, decisiones) + commit pendientes |
| 2026-09-11 | Cierre Sprint 1 — blockers resueltos | 6 commits: cleanup useWorkspace stale, deps faltantes (@dnd-kit/utilities, @valkey/valkey-glide, bcryptjs), bcrypt real en authorize (cierra backdoor de auth), TODOs multi-tenant en dashboard resueltos con getTenantSession, .gitignore + tooling stale (git_health, reforge-state, queue.setup.ts.bak), prisma migrate baseline init. Sprint 2-4 commits: `5b92f40` migrar next lint a eslint, `db9b07c` middleware redirect a /login |
| 2026-09-12 | Post-auditoría — cierre de brechas críticas | `01ab6f2`: tenant isolation en 5 repos CRM/Inventory + IDOR fix en jobs/invoice-generate + RLS activado en 16 tablas + movement/supplier repos implementados + sidebar honesty + session.ts hardened. **4/4 issues de seguridad críticos cerrados**. Pendientes restantes catalogados en sección "Hallazgos pendientes". |
| 2026-09-12 | IDOR fix en auth.config.ts tenant-switch | Cierra hallazgo pendiente línea 170 de PROJECT.md. Verificación: `npx tsc --noEmit` 0 errores, `npm run build (MOCK_REDIS=true)` exit 0, lookup `WorkspaceUser.findUnique({workspaceId_userId})` O(log n) usando el índice compuesto ya existente. Pendiente secundario: `session.maxAge` no configurado (default 30 días). | |
