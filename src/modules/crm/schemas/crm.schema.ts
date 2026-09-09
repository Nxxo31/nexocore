// NexoCore — CRM Validation Schemas (Zod)
// Validación ambos lados: API routes + Client forms

import { z } from "zod";

// --- Contact ---

export const contactCreateSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  company: z.string().optional().or(z.literal("")),
  documentType: z.string().optional().or(z.literal("")),
  document: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  tags: z.array(z.string()).optional().default([]),
  stage: z.string().optional(),
  assignedTo: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional().default(true),
});

export const contactUpdateSchema = contactCreateSchema.partial();

export type ContactCreateInput = z.infer<typeof contactCreateSchema>;
export type ContactUpdateInput = z.infer<typeof contactUpdateSchema>;

// --- Deal ---

export const dealCreateSchema = z.object({
  contactId: z.string().min(1, "Contacto requerido"),
  title: z.string().min(2, "El título debe tener al menos 2 caracteres"),
  value: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v))
    .refine((v) => !isNaN(v) && v >= 0, "El valor debe ser un número positivo"),
  stage: z.string().optional().default("lead"),
  probability: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? parseInt(v, 10) : v))
    .refine((v) => !isNaN(v) && v >= 0 && v <= 100, "Probabilidad debe estar entre 0 y 100")
    .optional()
    .default(0),
  expectedCloseAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? new Date(v) : undefined)),
  assignedTo: z.string().optional().or(z.literal("")),
});

export const dealUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  value: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? parseFloat(v) : v))
    .refine((v) => !isNaN(v) && v >= 0)
    .optional(),
  stage: z.string().optional(),
  probability: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? parseInt(v, 10) : v))
    .refine((v) => !isNaN(v) && v >= 0 && v <= 100)
    .optional(),
  expectedCloseAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? new Date(v) : undefined)),
  assignedTo: z.string().optional().or(z.literal("")),
  lostReason: z.string().optional(),
});

export const dealMoveSchema = z.object({
  dealId: z.string().min(1),
  newStage: z.string().min(1),
});

export type DealCreateInput = z.infer<typeof dealCreateSchema>;
export type DealUpdateInput = z.infer<typeof dealUpdateSchema>;
export type DealMoveInput = z.infer<typeof dealMoveSchema>;

// --- PipelineStage ---

export const stageCreateSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  color: z.string().optional().default("slate"),
  probability: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? parseInt(v, 10) : v))
    .refine((v) => !isNaN(v) && v >= 0 && v <= 100)
    .optional()
    .default(0),
  isWon: z.boolean().optional().default(false),
  isLost: z.boolean().optional().default(false),
  isClosed: z.boolean().optional().default(false),
});

export const stageUpdateSchema = stageCreateSchema.partial();

export const stageReorderSchema = z.object({
  stageIds: z.array(z.string()).min(1),
});

export type StageCreateInput = z.infer<typeof stageCreateSchema>;
export type StageUpdateInput = z.infer<typeof stageUpdateSchema>;
export type StageReorderInput = z.infer<typeof stageReorderSchema>;
