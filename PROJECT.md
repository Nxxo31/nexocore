# NexoCore — Plataforma SaaS Multi-Tenant ERP/CRM/Analytics para PYMEs
**Versión:** 2026.08.07 | **Sprint:** 1 (Semana 1) — Base y plantillas
**Estado:** EN PROGRESO

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

## Sprint 1 — Entregables

- [x] Setup Next.js 15 + Prisma + TypeScript
- [x] schema.prisma completo (todas las tablas multi-tenant)
- [x] 7 plantillas de nicho en Template Factory
- [x] NextAuth v5 multi-tenant con tenant_id en JWT
- [x] Middleware multi-tenant (subdominio + JWT)
- [x] Onboarding con selector de nicho
- [x] Layout dashboard con sidebar dinámico según plantilla
- [x] PROJECT.md

## Decisiones Técnicas

- Server Components por defecto. Client Components solo donde hay interactividad
- Zod para validación en ambos lados
- Paginación cursor-based
- tenant_id NUNCA en URLs públicas — siempre desde JWT
- Repository Pattern con tenant isolation automático

## Limitaciones Conocidas

- Sprint 1 no incluye STRIPE (va en Sprint 4)
- Sprint 1 no incluye BullMQ jobs (van en Sprint 2-4)
- El template override por usuario no está implementado aún (template base solo)

## Traza

| Fecha | Sesión | Cambio |
|-------|--------|--------|
| 2026-08-07 | Sprint 1 kickoff | Setup proyecto, schema, plantillas, auth, middleware, onboarding, layout |
