"use client";

import { useState } from "react";
import { WorkspaceMembers } from "@/components/workspace/workspace-members";
import { WorkspaceProjects } from "@/components/workspace/workspace-projects";
import { WorkspaceReports } from "@/components/workspace/workspace-reports";
import { WorkspaceSectorView } from "@/components/workspace/workspace-sector-view";
import { CreateProjectDialog } from "@/components/create-project-dialog";
import { WorkspaceFinance } from "@/components/workspace/workspace-finance";

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

interface ReportTask {
  id: string;
  columnId: string;
  dueDate: string | null;
  column: { name: string };
  priority: { name: string };
}

interface ReportProject {
  id: string;
  name: string;
  color: string;
  departments: { id: string; name: string; label: string; color: string; bgColor: string }[];
  tasks: ReportTask[];
}

interface SectorTask {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  createdAt: string;
  column: { name: string; label: string; color: string };
  priority: { name: string; label: string; color: string; dotColor: string };
  assignee: {
    id: string;
    name: string;
    initials: string;
    department: { label: string; color: string; bgColor: string };
  };
  project: {
    id: string;
    name: string;
    color: string;
    departments: { label: string }[];
  };
  tags: { id: string; name: string }[];
}

interface SectorData {
  department: { id: string; name: string; label: string; color: string; bgColor: string };
  tasks: SectorTask[];
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
  reportProjects?: ReportProject[] | null;
  sectorData?: SectorData | null;
}

export function WorkspaceContent({
  workspace,
  departments,
  activeSection,
  reportProjects,
  sectorData,
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

        {activeSection === "proyectos" && (
          <div className="mx-auto max-w-4xl">
            <WorkspaceProjects
              workspaceId={workspace.id}
              projects={workspace.projects}
              departments={departments}
            />
          </div>
        )}

        {activeSection === "reportes" && reportProjects && (
          <div className="mx-auto max-w-4xl">
            <WorkspaceReports projects={reportProjects} />
          </div>
        )}

        {activeSection === "sector" && sectorData && (
          <div className="mx-auto max-w-5xl">
            <WorkspaceSectorView
              department={sectorData.department}
              tasks={sectorData.tasks}
              workspaceId={workspace.id}
            />
          </div>
        )}

        {activeSection === "finanzas" && (
          <div className="mx-auto max-w-5xl">
            <WorkspaceFinance workspaceId={workspace.id} />
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
