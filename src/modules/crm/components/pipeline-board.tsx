// NexoCore — Pipeline Board (Client Component)
// Visual kanban board with drag-and-drop deals between stages

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragEndEvent,
  useDroppable,
} from "@dnd-kit/core";
import { DealCard } from "@/modules/crm/components/deal-card";
import type { DealPipe, PipelineStagePipe, PipelineSummary } from "@/modules/crm/types/pipeline.types";
import { Plus, TrendingUp, DollarSign, Trophy, Target } from "lucide-react";

interface PipelineBoardProps {
  initialStages: PipelineStagePipe[];
  initialDeals: DealPipe[];
  initialSummary: PipelineSummary;
  industry: string;
}

function StageColumn({
  stage,
  deals,
  isOver,
}: {
  stage: PipelineStagePipe;
  deals: DealPipe[];
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: stage.name,
    data: { stageName: stage.name },
  });

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  return (
    <div
      ref={setNodeRef}
      className={`flex w-72 shrink-0 flex-col rounded-xl border transition ${
        isOver
          ? "border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-blue-950/30"
          : "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2.5 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              stage.isWon
                ? "bg-green-500"
                : stage.isLost
                ? "bg-red-500"
                : "bg-slate-400"
            }`}
          />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {stage.name}
          </h3>
          <span className="rounded-full bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {deals.length}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          ${totalValue.toLocaleString()}
        </span>
      </div>

      {/* Deal cards */}
      <div className="flex-1 space-y-2 overflow-y-auto p-2 min-h-[200px]">
        {deals.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-xs text-slate-400 dark:text-slate-600">
            Arrastra deals aquí
          </div>
        ) : (
          deals.map((deal) => <DealCard key={deal.id} deal={deal} />)
        )}
      </div>

      {/* Add deal button */}
      <button className="flex items-center justify-center gap-1 border-t border-slate-200 py-2 text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
        <Plus className="h-3 w-3" />
        Agregar deal
      </button>
    </div>
  );
}

export function PipelineBoard({
  initialStages,
  initialDeals,
  initialSummary,
  industry,
}: PipelineBoardProps) {
  const [stages, setStages] = useState<PipelineStagePipe[]>(initialStages);
  const [deals, setDeals] = useState<DealPipe[]>(initialDeals);
  const [summary, setSummary] = useState<PipelineSummary>(initialSummary);
  const [activeDeal, setActiveDeal] = useState<DealPipe | null>(null);
  const [overStage, setOverStage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Group deals by stage
  const dealsByStage: Record<string, DealPipe[]> = {};
  for (const deal of deals) {
    if (!dealsByStage[deal.stage]) dealsByStage[deal.stage] = [];
    dealsByStage[deal.stage].push(deal);
  }

  const onDragStart = (event: DragStartEvent) => {
    const dealId = event.active.data.current?.dealId as string;
    const deal = deals.find((d) => d.id === dealId);
    setActiveDeal(deal || null);
  };

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDeal(null);
      setOverStage(null);

      if (!over) return;

      const dealId = active.data.current?.dealId as string;
      const newStage = over.id as string;
      const deal = deals.find((d) => d.id === dealId);

      if (!deal || deal.stage === newStage) return;

      // Optimistic update
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
      );

      // Find stage meta for won/lost/closed
      const stage = stages.find((s) => s.name === newStage);
      const updatedDeal = stage
        ? {
            ...deal,
            stage: newStage,
            probability: stage.isWon ? 100 : stage.isLost ? 0 : stage.probability,
            wonAt: stage.isWon ? new Date() : null,
            lostAt: stage.isLost ? new Date() : null,
          }
        : { ...deal, stage: newStage };

      setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)));

      // Persist via API
      setIsUpdating(true);
      try {
        const res = await fetch(`/api/crm/deals/${dealId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId, newStage }),
        });

        if (!res.ok) {
          // Revert on failure
          setDeals((prev) =>
            prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d))
          );
          console.error("Failed to move deal");
        } else {
          // Refresh summary
          const updated = await res.json();
          setDeals((prev) =>
            prev.map((d) => (d.id === dealId ? { ...updated, contact: deal.contact } : d))
          );
        }
      } catch {
        // Revert on error
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d))
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [deals, stages]
  );

  const onDragOver = (event: DragEndEvent) => {
    const { over } = event;
    setOverStage(over ? (over.id as string) : null);
  };

  return (
    <div className="space-y-4">
      {/* Pipeline summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Deals activos</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {summary.activeDeals}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Valor total</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            ${summary.totalValue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-green-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Ganado</span>
          </div>
          <p className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
            ${summary.wonValue.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className="text-xs text-slate-500 dark:text-slate-400">Total deals</span>
          </div>
          <p className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
            {summary.totalDeals}
          </p>
        </div>
      </div>

      {/* Status indicator */}
      {isUpdating && (
        <div className="flex items-center gap-2 text-xs text-blue-500">
          <div className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          Actualizando...
        </div>
      )}

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
      >
        <div className="flex gap-3 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <StageColumn
              key={stage.id}
              stage={stage}
              deals={dealsByStage[stage.name] || []}
              isOver={overStage === stage.name}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? <DealCard deal={activeDeal} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

export default PipelineBoard;
