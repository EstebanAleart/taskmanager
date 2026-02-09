import Link from "next/link";
import { ArrowLeft, Users, FolderKanban, StickyNote, LinkIcon } from "lucide-react";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <Link
            href="/dashboard"
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-lg font-bold">Workspace</h1>
          <span className="text-sm text-muted-foreground">ID: {workspaceId}</span>
        </div>
      </nav>

      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Notas */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <StickyNote className="h-5 w-5 text-amber-400" />
              <h2 className="font-display text-lg font-semibold">Notas</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Bloc de notas del workspace. Proximamente editable.
            </p>
          </div>

          {/* Links */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-blue-400" />
              <h2 className="font-display text-lg font-semibold">Links</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Links utiles del workspace. Proximamente editable.
            </p>
          </div>

          {/* Miembros */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald-400" />
              <h2 className="font-display text-lg font-semibold">Miembros</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Invita y gestiona miembros del workspace.
            </p>
          </div>

          {/* Proyectos */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-purple-400" />
              <h2 className="font-display text-lg font-semibold">Proyectos</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Proyectos dentro de este workspace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
