"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FolderKanban, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { toast } from "sonner";
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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDeleteProject = (id: string, name: string) => {
    toast.warning(`Eliminar "${name}"?`, {
      description: "Se eliminaran todas las tareas, columnas, links y datos asociados. Esta accion es permanente.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          setDeletingId(id);
          try {
            const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
            if (res.ok) {
              toast.success("Proyecto eliminado");
              router.refresh();
            } else {
              toast.error("Error al eliminar el proyecto");
            }
          } catch {
            toast.error("Error al eliminar el proyecto");
          } finally {
            setDeletingId(null);
          }
        },
      },
      cancel: {
        label: "Cancelar",
        onClick: () => {},
      },
    });
  };

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
            className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
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
              <div className="flex-1">
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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDeleteProject(project.id, project.name);
                }}
                disabled={deletingId === project.id}
                className="rounded-md p-1.5 text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
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
