"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Users, FolderKanban, LayoutDashboard } from "lucide-react";
import { CreateWorkspaceDialog } from "@/components/create-workspace-dialog";
import { SeedButton } from "@/components/seed-button";

interface WorkspaceItem {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  _count: { members: number; projects: number };
}

interface DashboardClientProps {
  workspaces: WorkspaceItem[];
  needsSeed: boolean;
}

export function DashboardClient({ workspaces, needsSeed }: DashboardClientProps) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Workspaces
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {workspaces.length} espacio{workspaces.length !== 1 ? "s" : ""} de trabajo
            </p>
          </div>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Nuevo Workspace
          </button>
        </div>

        {needsSeed && workspaces.length === 0 && (
          <div className="mb-8 rounded-xl border border-dashed border-border p-8 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              La base de datos esta vacia. Inicializa los datos base (departamentos, usuarios) para comenzar.
            </p>
            <SeedButton />
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((ws) => (
            <Link
              key={ws.id}
              href={`/workspace/${ws.id}`}
              className="group rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15">
                    <LayoutDashboard className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {ws.name}
                    </h3>
                    {ws.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                        {ws.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4" />
                  {ws._count.members} miembro{ws._count.members !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1.5">
                  <FolderKanban className="h-4 w-4" />
                  {ws._count.projects} proyecto{ws._count.projects !== 1 ? "s" : ""}
                </span>
              </div>
            </Link>
          ))}

          {/* Create workspace card */}
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-5 transition-all hover:border-primary/30 hover:bg-muted/30"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
              <Plus className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Crear workspace
            </p>
          </button>
        </div>
      </div>

      <CreateWorkspaceDialog open={createOpen} onOpenChange={setCreateOpen} />
    </>
  );
}
