"use client";

import { useState } from "react";
import { LayoutDashboard, StickyNote, LinkIcon, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProjectKanban } from "@/components/project/project-kanban";
import { ProjectNotes } from "@/components/project/project-notes";
import { ProjectLinks } from "@/components/project/project-links";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TaskTag {
  id: string;
  name: string;
}

interface PriorityItem {
  id: string;
  name: string;
  label: string;
  color: string;
  dotColor: string;
}

interface TaskAssignee {
  id: string;
  name: string;
  initials: string;
  department: { name: string; label: string; color: string; bgColor: string };
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priorityId: string;
  priority: PriorityItem;
  dueDate: string | null;
  createdAt: string;
  assignee: TaskAssignee;
  tags: TaskTag[];
}

interface ColumnItem {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string;
  order: number;
}

interface UserOption {
  id: string;
  name: string;
  initials: string;
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface DepartmentBadge {
  label: string;
  color: string;
  bgColor: string;
}

interface ProjectContentProps {
  projectId: string;
  workspaceId: string;
  projectName: string;
  projectColor: string;
  departments: DepartmentBadge[];
  taskCount: number;
  notes: string;
  links: LinkItem[];
  tasks: TaskItem[];
  columns: ColumnItem[];
  priorities: PriorityItem[];
  users: UserOption[];
  hasUsers: boolean;
}

const TABS = [
  { id: "tablero", label: "Tablero", icon: LayoutDashboard },
  { id: "notas", label: "Notas", icon: StickyNote },
  { id: "links", label: "Links", icon: LinkIcon },
];

export function ProjectContent({
  projectId,
  workspaceId,
  projectName,
  projectColor,
  departments,
  taskCount,
  notes,
  links,
  tasks,
  columns,
  priorities,
  users,
  hasUsers,
}: ProjectContentProps) {
  const [activeTab, setActiveTab] = useState("tablero");
  const router = useRouter();

  const handleDeleteProject = () => {
    toast.warning(`Eliminar "${projectName}"?`, {
      description: "Se eliminaran todas las tareas, columnas, links y datos asociados. Esta accion es permanente.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            const res = await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
            if (res.ok) {
              toast.success("Proyecto eliminado");
              router.push(`/workspace/${workspaceId}?section=proyectos`);
              router.refresh();
            } else {
              toast.error("Error al eliminar el proyecto");
            }
          } catch {
            toast.error("Error al eliminar el proyecto");
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
    <div className="h-full text-foreground">
      {/* Project header */}
      <div className="border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              projectColor + "/15"
            )}
          >
            <div className={cn("h-2.5 w-2.5 rounded-sm", projectColor)} />
          </div>
          <h1 className="font-display text-lg font-bold">{projectName}</h1>
          {departments.map((dept) => (
            <Badge
              key={dept.label}
              variant="secondary"
              className={cn("text-xs", dept.bgColor, dept.color)}
            >
              {dept.label}
            </Badge>
          ))}
          <span className="text-sm text-muted-foreground">
            {taskCount} tarea{taskCount !== 1 ? "s" : ""}
          </span>
          <div className="ml-auto">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleDeleteProject}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-3 flex gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                  activeTab === tab.id
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {tab.id === "links" && links.length > 0 && (
                  <span className="ml-1 text-xs opacity-60">{links.length}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-6">
        {activeTab === "tablero" && (
          <>
            {!hasUsers ? (
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Agrega miembros al workspace para poder crear tareas y asignarlas.
                </p>
                <Link
                  href={`/workspace/${workspaceId}?section=miembros`}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Miembros
                </Link>
              </div>
            ) : (
              <ProjectKanban
                tasks={tasks}
                columns={columns}
                priorities={priorities}
                users={users}
                projectId={projectId}
              />
            )}
          </>
        )}

        {activeTab === "notas" && (
          <ProjectNotes projectId={projectId} initialNotes={notes} />
        )}

        {activeTab === "links" && (
          <ProjectLinks projectId={projectId} links={links} />
        )}
      </div>
    </div>
  );
}
