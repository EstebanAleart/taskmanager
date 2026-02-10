"use client";

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  columnId: string;
  dueDate: string | null;
  column: { name: string };
  priority: { name: string };
}

interface ProjectStat {
  id: string;
  name: string;
  color: string;
  departments: { id: string; name: string; label: string; color: string; bgColor: string }[];
  tasks: TaskItem[];
}

interface WorkspaceReportsProps {
  projects: ProjectStat[];
}

export function WorkspaceReports({ projects }: WorkspaceReportsProps) {
  const allTasks = projects.flatMap((p) => p.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.column.name === "completada").length;
  const inProgressTasks = allTasks.filter((t) => t.column.name === "en_progreso").length;
  const urgentTasks = allTasks.filter((t) => t.priority.name === "urgente").length;
  const now = new Date();
  const overdueTasks = allTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.column.name !== "completada"
  ).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const statCards = [
    { label: "Tareas Totales", value: totalTasks, icon: BarChart3, color: "text-primary", bgColor: "bg-primary/10" },
    { label: "Completadas", value: completedTasks, icon: CheckCircle2, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
    { label: "En Progreso", value: inProgressTasks, icon: Clock, color: "text-blue-500", bgColor: "bg-blue-500/10" },
    { label: "Urgentes", value: urgentTasks, icon: AlertTriangle, color: "text-red-500", bgColor: "bg-red-500/10" },
    { label: "Vencidas", value: overdueTasks, icon: Target, color: "text-orange-500", bgColor: "bg-orange-500/10" },
    { label: "Tasa de avance", value: `${completionRate}%`, icon: TrendingUp, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  ];

  // Collect unique departments across all projects
  const deptMap = new Map<string, { id: string; name: string; label: string; color: string; bgColor: string }>();
  for (const p of projects) {
    for (const d of p.departments) {
      if (!deptMap.has(d.id)) deptMap.set(d.id, d);
    }
  }

  const deptStats = Array.from(deptMap.values()).map((dept) => {
    const deptProjects = projects.filter((p) => p.departments.some((d) => d.id === dept.id));
    const deptTasks = deptProjects.flatMap((p) => p.tasks);
    const deptCompleted = deptTasks.filter((t) => t.column.name === "completada").length;
    return {
      ...dept,
      total: deptTasks.length,
      completed: deptCompleted,
      rate: deptTasks.length > 0 ? Math.round((deptCompleted / deptTasks.length) * 100) : 0,
    };
  });

  // Progress bar color from department bgColor (extract the color name)
  const progressColor = (bgColor: string) => {
    const match = bgColor.match(/bg-(\w+)-/);
    return match ? `bg-${match[1]}-500` : "bg-primary";
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Reportes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general del workspace
        </p>
      </div>

      {totalTasks === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <BarChart3 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No hay tareas todavia. Crea proyectos y tareas para ver reportes.
          </p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-3">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className="rounded-xl border border-border bg-card p-5"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className={cn("rounded-lg p-2", stat.bgColor)}>
                      <Icon className={cn("h-5 w-5", stat.color)} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Department Breakdown */}
          {deptStats.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">
                Por Sector
              </h3>
              <div className="space-y-4">
                {deptStats.map((dept) => (
                  <div key={dept.id}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
                            dept.bgColor,
                            dept.color
                          )}
                        >
                          {dept.label}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {dept.completed}/{dept.total} tareas
                        </span>
                      </div>
                      <span className="text-sm font-medium text-card-foreground">
                        {dept.rate}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className={cn("h-full rounded-full transition-all", progressColor(dept.bgColor))}
                        style={{ width: `${dept.rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects Summary */}
          <div className="mt-6 rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">
              Proyectos
            </h3>
            <div className="space-y-3">
              {projects.map((project) => {
                const total = project.tasks.length;
                const done = project.tasks.filter((t) => t.column.name === "completada").length;
                const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <div
                    key={project.id}
                    className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className={cn("h-3 w-3 rounded-sm", project.color)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-card-foreground">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {done}/{total} completadas
                      </p>
                    </div>
                    <div className="w-24">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", project.color)}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-card-foreground">
                      {progress}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
