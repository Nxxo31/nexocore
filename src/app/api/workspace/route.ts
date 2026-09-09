// NexoCore — Workspace API (Onboarding flow)
// POST /api/workspace → create a new Workspace + WorkspaceUser,
//   seed pipeline stages from the industry template, and enqueue
//   a welcome email via the BullMQ emailQueue.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/shared/database/prisma";
import { auth } from "@/modules/auth/auth.config";
import { TemplateFactory } from "@/modules/templates/templates";
import type { Industry } from "@/modules/templates/template.types";
import { EmailJobProducer } from "@/modules/jobs/producer";
import { AuditService } from "@/modules/audit/services/audit.service";

const workspaceCreateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  slug: z
    .string()
    .min(3, "El slug debe tener al menos 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "El slug solo puede contener minúsculas, números y guiones"),
  industry: z.enum([
    "FERRETERIA",
    "RESTAURANTE",
    "CONSULTORA",
    "RETAIL",
    "CLINICA",
    "PAPELERIA",
    "CARNICERIA",
  ]),
  templateId: z.string(),
  city: z.string().optional(),
  currency: z.string().default("COP"),
  logoUrl: z.string().url().optional().or(z.literal("")),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = workspaceCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validación fallida", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { name, slug, industry, templateId, city, currency, logoUrl } = parsed.data;

    // Check slug uniqueness
    const existingSlug = await prisma.workspace.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      return NextResponse.json(
        { error: "El slug ya está en uso" },
        { status: 409 }
      );
    }

    const template = TemplateFactory.getById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Plantilla no encontrada" },
        { status: 400 }
      );
    }

    // Store the city in templateConfig (no dedicated column in the schema)
    const templateConfig = city ? { city } : {};

    // 1. Create the workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        industry: industry as Industry,
        templateId,
        templateConfig,
        plan: "STARTER",
        currency,
        ...(logoUrl ? { logoUrl } : {}),
      },
    });

    // 2. Link the current user as OWNER
    await prisma.workspaceUser.create({
      data: {
        workspaceId: workspace.id,
        userId: session.user.id,
        role: "OWNER",
      },
    });

    // 3. Seed pipeline stages from the industry template
    const stages = template.pipelineStages;
    if (stages.length > 0) {
      await prisma.pipelineStage.createMany({
        data: stages.map((stage, index) => ({
          tenantId: workspace.id,
          name: stage.name,
          position: index,
          color: stage.color,
          probability: stage.probability,
          isWon: stage.isWon ?? false,
          isLost: false,
          isClosed: stage.isWon ?? false,
        })),
      });
    }

    // 4. Enqueue the welcome email via BullMQ emailQueue
    const userEmail = session.user.email;
    const userName = session.user.name ?? name;
    if (userEmail) {
      try {
        await EmailJobProducer.addWelcomeEmailJob(userEmail, userName, workspace.name);
      } catch (emailError) {
        // Email enqueue failure is non-fatal — workspace creation already succeeded
        console.error("[Workspace API] Failed to enqueue welcome email:", emailError);
      }
    }

    // 5. Audit log
    await AuditService.logCreate(
      workspace.id,
      session.user.id,
      "Workspace",
      workspace.id,
      { name, slug, industry }
    );

    return NextResponse.json(
      {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        industry: workspace.industry,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Error al crear workspace" },
      { status: 500 }
    );
  }
}
