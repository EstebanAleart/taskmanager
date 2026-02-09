import { notFound } from "next/navigation";
import { getProject } from "@/lib/actions/project";
import { getProjectMembers } from "@/lib/actions/task";
import { ProjectKanban } from "@/components/project/project-kanban";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceId, projectId } = await params;
  const project = await getProject(projectId);

  if (!project || project.workspaceId !== workspaceId) {
    notFound();
  }

  const users = await getProjectMembers(projectId);

  const serializedTasks = project.tasks.map((t) => ({
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
  }));

  const userOptions = users.map((u) => ({
    id: u.id,
    name: u.name,
    initials: u.initials,
  }));

  return (
    <div className="h-full text-foreground">
      {/* Project header */}
      <div className="border-b border-border/50 px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              project.color + "/15"
            )}
          >
            <div className={cn("h-2.5 w-2.5 rounded-sm", project.color)} />
          </div>
          <h1 className="font-display text-lg font-bold">{project.name}</h1>
          <Badge
            variant="secondary"
            className={cn(
              "text-xs",
              project.department.bgColor,
              project.department.color
            )}
          >
            {project.department.label}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {project.tasks.length} tarea{project.tasks.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="p-6">
        {users.length === 0 ? (
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
            tasks={serializedTasks}
            columns={project.columns}
            priorities={project.priorities}
            users={userOptions}
            projectId={projectId}
          />
        )}
      </div>
    </div>
  );
}
