"use client";

import { useState } from "react";
import { WorkspaceNotes } from "@/components/workspace/workspace-notes";
import { WorkspaceLinks } from "@/components/workspace/workspace-links";
import { WorkspaceMembers } from "@/components/workspace/workspace-members";
import { WorkspaceProjects } from "@/components/workspace/workspace-projects";
import { CreateProjectDialog } from "@/components/create-project-dialog";

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

interface WorkspaceContentProps {
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
  activeSection: string;
}

export function WorkspaceContent({
  workspace,
  departments,
  activeSection,
}: WorkspaceContentProps) {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  return (
    <>
      <div className="p-4 lg:p-6">
        {activeSection === "notas" && (
          <div className="mx-auto max-w-3xl">
            <div className="mb-6">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Notas
              </h2>
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
              <h2 className="font-display text-2xl font-bold text-foreground">
                Links
              </h2>
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
              <h2 className="font-display text-2xl font-bold text-foreground">
                Miembros
              </h2>
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

      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        workspaceId={workspace.id}
        departments={departments}
      />
    </>
  );
}
