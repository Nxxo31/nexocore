// NexoCore — Dashboard Layout
// Sidebar dinámico según plantilla del workspace

import { TemplateFactory } from "@/modules/templates/templates";
import type { Industry } from "@/modules/templates/template.types";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Users,
  Contact,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  FolderKanban,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

// Map icon string names to Lucide components
const ICONS: Record<string, LucideIcon> = {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Truck,
  Users,
  Contact,
  FileText,
  BarChart3,
  Settings,
  Calendar,
  FolderKanban,
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // TODO: get from session JWT in production
  // For now uses a demo industry
  const industry: Industry = "FERRETERIA";
  const template = TemplateFactory.create(industry);

  const enabledNavItems = template.navItems.filter((item) => item.enabled);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {/* Logo / Workspace name */}
        <div className="flex h-16 items-center border-b border-slate-200 px-6 dark:border-slate-800">
          <span className="text-lg font-bold text-slate-900 dark:text-white">
            NexoCore
          </span>
        </div>

        {/* Industry badge */}
        <div className="px-6 py-3">
          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {template.name}
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
          {enabledNavItems.map((item) => {
            const Icon = ICONS[item.icon] || LayoutDashboard;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User / workspace footer */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-300 dark:bg-slate-700" />
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Admin
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Plan Starter
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        {/* Top bar with workspace vocabulary context */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
              {template.vocabulary.product}s
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {template.vocabulary.client} → {template.vocabulary.deal}
            </span>
          </div>
        </header>

        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
