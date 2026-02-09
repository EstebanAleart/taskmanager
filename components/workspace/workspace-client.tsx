"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { WorkspaceNotes } from "@/components/workspace/workspace-notes";
import { WorkspaceLinks } from "@/components/workspace/workspace-links";
import { WorkspaceMembers } from "@/components/workspace/workspace-members";
import { WorkspaceProjects } from "@/components/workspace/workspace-projects";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { cn } from "@/lib/utils";

interface MemberItem {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    initials: string;
    role: string;
    department: { name: string; label: string; color: string; bgColor: string };
  };
}

interface LinkItem {
  id: string;
  title: string;
  url: string;
}

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  color: string;
  department: { name: string; label: string; color: string; bgColor: string };
  _count: { tasks: number; members: number };
}

interface DepartmentItem {
  id: string;
  name: string;
  label: string;
}

interface WorkspaceClientProps {
  workspace: {
    id: string;
    name: string;
    description: string;
    notes: string;
    members: MemberItem[];
    projects: ProjectItem[];
    links: LinkItem[];
  };
  departments: DepartmentItem[];
}

export function WorkspaceClient({ workspace, departments }: WorkspaceClientProps) {
  const [activeSection, setActiveSection] = useState("notas");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <WorkspaceSidebar
          workspaceId={workspace.id}
          workspaceName={workspace.name}
          activeSection={activeSection}
          onSectionChange={(section) => {
            setActiveSection(section);
            setSidebarOpen(false);
          }}
          members={workspace.members}
          projects={workspace.projects}
          onCreateProject={() => setCreateProjectOpen(true)}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-bold text-foreground">
            {workspace.name}
          </h1>
          <div className="w-9" />
        </div>

        <div className="p-4 lg:p-6">
          {activeSection === "notas" && (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">Notas</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Bloc de notas del workspace
                </p>
              </div>
              <WorkspaceNotes
                workspaceId={workspace.id}
                initialNotes={workspace.notes}
              />
            </div>
          )}

          {activeSection === "links" && (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">Links</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Links utiles del workspace
                </p>
              </div>
              <WorkspaceLinks
                workspaceId={workspace.id}
                links={workspace.links}
              />
            </div>
          )}

          {activeSection === "miembros" && (
            <div className="mx-auto max-w-3xl">
              <div className="mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground">Miembros</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Gestiona los miembros del workspace
                </p>
              </div>
              <WorkspaceMembers
                workspaceId={workspace.id}
                members={workspace.members}
              />
            </div>
          )}

          {activeSection === "proyectos" && (
            <div className="mx-auto max-w-4xl">
              <WorkspaceProjects
                workspaceId={workspace.id}
                projects={workspace.projects}
                departments={departments}
              />
            </div>
          )}
        </div>
      </main>

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        workspaceId={workspace.id}
        departments={departments}
      />
    </div>
  );
}
