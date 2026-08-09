// NexoCore — CRM Pipeline Page (Server Component)
// Visual kanban board with drag-and-drop deals between pipeline stages

import { getTenantSession } from "@/shared/auth/session";
import { TemplateFactory } from "@/modules/templates/templates";
import { PipelineStageRepository } from "@/modules/crm/repositories/pipeline.repository";
import { DealRepository } from "@/modules/crm/repositories/deal.repository";
import { PipelineBoard } from "@/modules/crm/components/pipeline-board";
import type { DealPipe, PipelineStagePipe, PipelineSummary } from "@/modules/crm/types/pipeline.types";

export default async function PipelinePage() {
  const session = await getTenantSession();
  const stageRepo = new PipelineStageRepository(session.tenantId);
  const dealRepo = new DealRepository(session.tenantId);

  // Get template stages as fallback
  const template = TemplateFactory.create(session.industry);

  let stages: PipelineStagePipe[];
  let deals: DealPipe[];
  let summary: PipelineSummary;

  try {
    // Try to get stages from DB
    const dbStages = await stageRepo.findOrdered();

    if (dbStages.length > 0) {
      // Use DB stages
      stages = dbStages.map((s) => ({
        id: s.id,
        name: s.name,
        position: s.position,
        color: s.color,
        probability: s.probability,
        isWon: s.isWon,
        isLost: s.isLost,
        isClosed: s.isClosed,
      }));
    } else {
      // Fallback to template stages
      stages = template.pipelineStages.map((s, i) => ({
        id: s.id,
        name: s.name,
        position: i,
        color: s.color,
        probability: s.probability,
        isWon: s.isWon || false,
        isLost: s.isLost || false,
        isClosed: false,
      }));
    }

    // Get deals grouped by stage
    const [byStage, dbSummary] = await Promise.all([
      dealRepo.findByStages(),
      dealRepo.getPipelineSummary(),
    ]);

    // Flatten deals for the board
    deals = byStage.flatMap((group) =>
      group.deals.map((d) => ({
        id: d.id,
        title: d.title,
        value: Number(d.value),
        stage: d.stage,
        probability: d.probability,
        contact: {
          id: d.contact.id,
          name: d.contact.name,
          email: d.contact.email,
          company: d.contact.company,
        },
        assignedTo: d.assignedTo,
        expectedCloseAt: d.expectedCloseAt,
        wonAt: d.wonAt,
        lostAt: d.lostAt,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }))
    );

    summary = dbSummary;
  } catch {
    // If DB is not available, use empty placeholder data
    stages = template.pipelineStages.map((s, i) => ({
      id: s.id,
      name: s.name,
      position: i,
      color: s.color,
      probability: s.probability,
      isWon: s.isWon || false,
      isLost: s.isLost || false,
      isClosed: false,
    }));
    deals = [];
    summary = { totalDeals: 0, totalValue: 0, wonValue: 0, activeDeals: 0 };
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Pipeline de {template.vocabulary.deal}s
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Arrastra {template.vocabulary.deal.toLowerCase()}s entre etapas para actualizar
          su estado automáticamente.
        </p>
      </div>

      {/* Pipeline Board (Client Component) */}
      <PipelineBoard
        initialStages={stages}
        initialDeals={deals}
        initialSummary={summary}
        industry={session.industry}
      />
    </div>
  );
}
