# NexoCore — Contexto del agente

## Proyecto
Plataforma SaaS multi-tenant ERP/CRM/Analytics para PYMEs con plantillas de nicho.
GitHub: https://github.com/Nxxo31/nexocore

## Stack
- Next.js 15 App Router + TypeScript 5
- PostgreSQL + Prisma ORM
- NextAuth v5 (multi-tenant con tenant_id en JWT)
- shadcn/ui + Tailwind CSS
- BullMQ + Redis (background jobs — sin implementar aún)
- Stripe (billing — sin implementar aún)
- Resend (email — sin implementar aún)

## Arquitectura
- Multi-tenant: Hybrid Pool/Silo (MVP = Pool con RLS)
- Identificación: subdominio + JWT claim
- 7 plantillas de nicho: Ferretería, Restaurante, Consultora, Retail, Clínica, Papelería, Carnicería

## Design System
- **shadcn/ui** para componentes base (Button, Card, Dialog, Table, Input, Select, Tabs)
- **Tailwind CSS** para layout y utilidades. NO CSS inline ni styled-components.
- **`cn()`** (clsx + tailwind-merge) en `src/shared/lib/cn.ts` para clases condicionales.
- **Iconos:** lucide-react. NO emoji en UI.
- **Colores:** variables CSS de shadcn (`--background`, `--foreground`, `--primary`). No hardcodear hex.
- **Tipografía:** font-sans (Inter). sin.Override solo si la plantilla de nicho lo define.

## Verificación (NO tests unitarios)
- LSP: `mcp__lsp_intelligence__live_diagnostics` — 0 errores
- Build: `npx next build` — exit 0
- Code review: `delegate_task` con skill `code-review-and-quality`
- Secrets: `gitleaks detect --staged`
- Commit: GitHub MCP `push_files` o git CLI

## Loop de trabajo
1. `cat PROJECT.md` → verificar estado y sprint activo
2. `git status` → ver estado del repo
3. Verificar LSP activo: `hermes lsp status`
4. Implementar → LSP clean + build exit 0 + code review passed
5. Update PROJECT.md con resultados
6. Commit atómico en español → push vía GitHub MCP o git CLI

NO vitest, NO jest, NO playwright, NO `tsc --noEmit` directo. Gates determinísticos.
NO separate spec files — everything goes in PROJECT.md.

## Reglas críticas de Multi-Tenant

1. **TODA query Prisma filtra por tenant_id.** Sin `where: { tenantId }` = bug de seguridad.
2. **tenant_id SIEMPRE del JWT.** NUNCA de URLs, params, ni trust del cliente.
3. **No hardcodear tenant IDs.** Usar `getTenantId()` del contexto de sesión.
4. **RLS PostgreSQL activado** — defense-in-depth. Si el código falla, DB bloquea.
5. **searchParams es Promise<T> en Next.js 15.** SIEMPRE `await searchParams`. Olvidar esto = error runtime.
6. **Prisma generate después de cambios en schema.prisma.** Sin esto, tipos desalineados.
7. **Onboarding bonus/voucher de Pro:** Solo si `tenantId` verificado. No self-grant.

## Definition of Done (DoD) — Estado Observable

Un entregable está Done si TODAS estas son verdaderas y verificables con un comando:

1. `npx next build` → exit 0
2. `mcp__lsp_intelligence__live_diagnostics` → 0 errores
3. `npx prisma validate` → exit 0 (si se tocó schema)
4. `grep -r "tenantId" src/` → toda query Prisma tiene `where: { tenantId }`
5. `gitleaks detect --staged` → 0 findings
6. `delegate_task` code review → passed
7. PROJECT.md R-XX marcado ✅ Done
8. Commit atómico → push exitoso

El DoD es un ESTADO, no una opinión. Si no puedes demostrarlo con un comando, no está Done.

## Boundaries 3-Tier (Always / Ask / Never)

### ✅ ALWAYS — Hacer sin preguntar
- Ejecutar `npx next build` antes de marcar Done
- Filtrar queries Prisma con `where: { tenantId }`
- Usar Server Components por defecto (`"use client"` solo con interactividad)
- Validar input con Zod en server y cliente
- Usar `cn()` de `src/shared/lib/cn.ts` para clases condicionales
- Actualizar PROJECT.md tras completar un requisito R-XX
- Commits atómicos en español (scope único)
- `prisma generate` tras editar `schema.prisma`
- `await searchParams` en server components
- Usar componentes shadcn/ui para UI base

### ⚠️ ASK — Confirmar con el usuario antes
- Añadir nuevas dependencias (`npm install ...`)
- Modificar `schema.prisma` (rompe DB existente)
- Cambiar la estratedgia multi-tenant (Pool → Silo)
- Añadir nuevas plantillas de nicho fuera de las 7 definidas
- Modificar el schema de autenticación NextAuth
- Eliminar módulos existentes
- Cambiar la estructura de directorios (`src/modules/`)
-\Configurar Stripe en producción (Sprint 4)
- Cambiar la port de dev server (3001+)

### ❌ NEVER — No hacer bajo ninguna circunstancia
- Commiter `.env`, `.env.local`, o credenciales
- Hardcodear tenant IDs en código (usar JWT/context)
- Exponer `tenant_id` en URLs públicas
- Usar `tsc --noEmit` directo (usar LSP)
- Crear archivos de test con Vitest/Jest/Playwright (no hay tests unitarios)
- Crear archivos spec separados (todo en PROJECT.md)
- Commitear sin `npx next build` exit 0
- Usar styled-components o CSS inline (usar Tailwind)
- Desactivar RLS en PostgreSQL
- Guardar secrets en código (usar .env + process.env)
- Commitear `node_modules/` o `.next/`
- Forzar push a main (`--force`) sin confirmación explícita
