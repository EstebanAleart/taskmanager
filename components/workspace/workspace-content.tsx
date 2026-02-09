"use client";

import { useState } from "react";
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

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  color: string;
  departments: { name: string; label: string; color: string; bgColor: string }[];
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
    members: MemberItem[];
    projects: ProjectItem[];
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

        {(activeSection === "proyectos" || activeSection === "notas" || activeSection === "links") && (
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
