import Link from "next/link";
import { ArrowLeft, LayoutDashboard } from "lucide-react";

interface ProjectPageProps {
  params: Promise<{ workspaceId: string; projectId: string }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { workspaceId, projectId } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link
            href={`/workspace/${workspaceId}`}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-lg font-bold">Proyecto</h1>
          <span className="text-sm text-muted-foreground">ID: {projectId}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/15">
            <LayoutDashboard className="h-6 w-6 text-blue-400" />
          </div>
          <h2 className="font-display text-xl font-semibold">Tablero del Proyecto</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Aca va el tablero Kanban con las tareas de este proyecto.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Workspace: {workspaceId} / Proyecto: {projectId}
          </p>
        </div>
      </div>
    </div>
  );
}
