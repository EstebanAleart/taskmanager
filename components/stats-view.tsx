"use client";

import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
} from "lucide-react";
import { INITIAL_TASKS, PROJECTS, DEPARTMENT_CONFIG, type Department } from "@/lib/data";
import { cn } from "@/lib/utils";

const TASKS = INITIAL_TASKS; // Declare the TASKS variable

export function StatsView() {
  const totalTasks = TASKS.length;
  const completedTasks = TASKS.filter((t) => t.columnId === "completada").length;
  const inProgressTasks = TASKS.filter((t) => t.columnId === "en_progreso").length;
  const urgentTasks = TASKS.filter((t) => t.priority === "urgente").length;
  const overdueTasks = TASKS.filter(
    (t) => new Date(t.dueDate) < new Date() && t.columnId !== "completada"
  ).length;

  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  const statCards = [
    {
      label: "Tareas Totales",
      value: totalTasks,
      icon: BarChart3,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Completadas",
      value: completedTasks,
      icon: CheckCircle2,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "En Progreso",
      value: inProgressTasks,
      icon: Clock,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Urgentes",
      value: urgentTasks,
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      label: "Vencidas",
      value: overdueTasks,
      icon: Target,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      label: "Tasa de avance",
      value: `${completionRate}%`,
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
  ];

  // By department
  const deptStats = (Object.keys(DEPARTMENT_CONFIG) as Department[]).map(
    (dept) => {
      const deptTasks = TASKS.filter((t) => t.department === dept);
      const deptCompleted = deptTasks.filter(
        (t) => t.columnId === "completada"
      ).length;
      const config = DEPARTMENT_CONFIG[dept];
      return {
        department: dept,
        label: config.label,
        color: config.color,
        bgColor: config.bgColor,
        total: deptTasks.length,
        completed: deptCompleted,
        rate: deptTasks.length > 0
          ? Math.round((deptCompleted / deptTasks.length) * 100)
          : 0,
      };
    }
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Reportes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Resumen general del equipo y proyectos
        </p>
      </div>

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
              <p className="text-2xl font-bold text-card-foreground">
                {stat.value}
              </p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Department Breakdown */}
      <div className="rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">
          Por Sector
        </h3>
        <div className="space-y-4">
          {deptStats.map((dept) => (
            <div key={dept.department}>
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
                  className={cn(
                    "h-full rounded-full transition-all",
                    dept.department === "desarrollo"
                      ? "bg-blue-500"
                      : dept.department === "data"
                        ? "bg-emerald-500"
                        : dept.department === "marketing"
                          ? "bg-amber-500"
                          : dept.department === "branding"
                            ? "bg-pink-500"
                            : "bg-orange-500"
                  )}
                  style={{ width: `${dept.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Summary */}
      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">
          Proyectos Activos
        </h3>
        <div className="space-y-3">
          {PROJECTS.map((project) => (
            <div
              key={project.id}
              className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/50"
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-sm",
                  project.color
                )}
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-card-foreground">
                  {project.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {project.tasksDone}/{project.tasksTotal} completadas
                </p>
              </div>
              <div className="w-24">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", project.color)}
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium text-card-foreground">
                {project.progress}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
