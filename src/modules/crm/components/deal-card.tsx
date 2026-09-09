// NexoCore — Deal Card (Client Component)
// Draggable card representing a single deal in the pipeline

"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { DealPipe } from "@/modules/crm/types/pipeline.types";
import { Building2, Calendar, User } from "lucide-react";

export function DealCard({ deal }: { deal: DealPipe }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: deal.id,
    data: { dealId: deal.id, currentStage: deal.stage },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  };

  const isWon = deal.wonAt !== null;
  const isLost = deal.lostAt !== null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group cursor-grab rounded-lg border p-3 shadow-sm transition hover:shadow-md active:cursor-grabbing ${
        isWon
          ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-950/40"
          : isLost
          ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/40"
          : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      {/* Title + value */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2">
          {deal.title}
        </h4>
        <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-200">
          ${deal.value.toLocaleString()}
        </span>
      </div>

      {/* Contact info */}
      <div className="mt-2 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <User className="h-3 w-3 shrink-0" />
          <span className="truncate">{deal.contact.name}</span>
        </div>
        {deal.contact.company && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{deal.contact.company}</span>
          </div>
        )}
        {deal.expectedCloseAt && (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <Calendar className="h-3 w-3 shrink-0" />
            <span>
              {new Date(deal.expectedCloseAt).toLocaleDateString("es", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
        )}
      </div>

      {/* Probability */}
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
          <div
            className={`h-full rounded-full transition-all ${
              isWon
                ? "bg-green-500"
                : isLost
                ? "bg-red-500"
                : "bg-blue-500"
            }`}
            style={{ width: `${deal.probability}%` }}
          />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {deal.probability}%
        </span>
      </div>

      {/* Status badges */}
      {(isWon || isLost) && (
        <div className="mt-2">
          <span
            className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${
              isWon
                ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
            }`}
          >
            {isWon ? "Ganado" : "Perdido"}
          </span>
        </div>
      )}
    </div>
  );
}

export default DealCard;
