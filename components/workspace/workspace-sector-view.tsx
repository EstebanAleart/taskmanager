"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TaskTag {
  id: string;
  name: string;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  createdAt: string;
  column: { name: string; label: string; color: string };
  priority: { name: string; label: string; color: string; dotColor: string };
  assignee: {
    id: string;
    name: string;
    initials: string;
    department: { label: string; color: string; bgColor: string };
  };
  project: {
    id: string;
    name: string;
    color: string;
    departments: { label: string }[];
  };
  tags: TaskTag[];
}

interface DepartmentInfo {
  id: string;
  name: string;
  label: string;
  color: string;
  bgColor: string;
}

interface WorkspaceSectorViewProps {
  department: DepartmentInfo;
  tasks: TaskItem[];
  workspaceId: string;
}

export function WorkspaceSectorView({ department, tasks, workspaceId }: WorkspaceSectorViewProps) {
  // Group tasks by project
  const byProject = new Map<string, { project: TaskItem["project"]; tasks: TaskItem[] }>();
  for (const task of tasks) {
    const existing = byProject.get(task.project.id);
    if (existing) {
      existing.tasks.push(task);
    } else {
      byProject.set(task.project.id, { project: task.project, tasks: [task] });
    }
  }

  const projectGroups = Array.from(byProject.values());

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl font-bold text-foreground">Sector</h2>
          <Badge
            variant="secondary"
            className={cn("text-sm", department.bgColor, department.color)}
          >
            {department.label}
          </Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {tasks.length} tarea{tasks.length !== 1 ? "s" : ""} en {projectGroups.length} proyecto{projectGroups.length !== 1 ? "s" : ""}
        </p>
      </div>

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No hay tareas en proyectos de este sector.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {projectGroups.map(({ project, tasks: projectTasks }) => (
            <div key={project.id} className="rounded-xl border border-border bg-card">
              {/* Project header */}
              <div className="flex items-center gap-3 border-b border-border px-5 py-3">
                <div className={cn("h-3 w-3 rounded-sm", project.color)} />
                <h3 className="font-display text-base font-semibold text-card-foreground">
                  {project.name}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {projectTasks.length} tarea{projectTasks.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Task list */}
              <div className="divide-y divide-border">
                {projectTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 px-5 py-3">
                    {/* Priority dot */}
                    <div className={cn("h-2 w-2 rounded-full", task.priority.dotColor)} />

                    {/* Task info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {task.description}
                        </p>
                      )}
                    </div>

                    {/* Column badge */}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
                        "bg-muted",
                        task.column.color
                      )}
                    >
                      {task.column.label}
                    </span>

                    {/* Priority badge */}
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium",
                        "bg-muted",
                        task.priority.color
                      )}
                    >
                      {task.priority.label}
                    </span>

                    {/* Assignee */}
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                          {task.assignee.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        {task.assignee.name}
                      </span>
                    </div>

                    {/* Due date */}
                    {task.dueDate && (
                      <span className={cn(
                        "text-xs",
                        new Date(task.dueDate) < new Date() && task.column.name !== "completada"
                          ? "text-red-500"
                          : "text-muted-foreground"
                      )}>
                        {new Date(task.dueDate).toLocaleDateString("es-AR", { day: "2-digit", month: "short" })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
