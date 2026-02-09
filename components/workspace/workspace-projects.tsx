"use client";

import { useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { cn } from "@/lib/utils";

interface DepartmentBadge {
  name: string;
  label: string;
  color: string;
  bgColor: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  color: string;
  departments: DepartmentBadge[];
  _count: { tasks: number; members: number };
}

interface DepartmentItem {
  id: string;
  name: string;
  label: string;
}

interface WorkspaceProjectsProps {
  workspaceId: string;
  projects: ProjectItem[];
  departments: DepartmentItem[];
}

export function WorkspaceProjects({ workspaceId, projects, departments }: WorkspaceProjectsProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderKanban className="h-5 w-5 text-purple-400" />
          <h2 className="font-display text-lg font-semibold">Proyectos</h2>
          <span className="text-xs text-muted-foreground">
            {projects.length} proyecto{projects.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {projects.map((project) => (
          <Link
            key={project.id}
            href={`/workspace/${workspaceId}/project/${project.id}`}
            className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
          >
            <div className="mb-3 flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg",
                  project.color + "/15"
                )}
              >
                <div className={cn("h-3 w-3 rounded-sm", project.color)} />
              </div>
              <div>
                <h3 className="font-semibold text-card-foreground">{project.name}</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {project.departments.map((dept) => (
                    <Badge
                      key={dept.name}
                      variant="secondary"
                      className={cn("text-xs", dept.bgColor, dept.color)}
                    >
                      {dept.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {project.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {project._count.tasks} tarea{project._count.tasks !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}

        {/* Create project card */}
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-5 transition-all hover:border-primary/30 hover:bg-muted/30"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">Crear proyecto</p>
        </button>
      </div>

      <CreateProjectDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        workspaceId={workspaceId}
        departments={departments}
      />
    </div>
  );
}
