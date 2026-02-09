import { notFound } from "next/navigation";
import { getWorkspace, getDepartments } from "@/lib/queries";
import { WorkspaceLayoutClient } from "@/components/workspace/workspace-layout-client";

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceLayout({
  children,
  params,
}: WorkspaceLayoutProps) {
  const { workspaceId } = await params;
  const workspace = await getWorkspace(workspaceId);

  if (!workspace) {
    notFound();
  }

  const departments = await getDepartments();

  const sidebarDepartments = departments.map((d) => ({
    id: d.id,
    name: d.name,
    label: d.label,
    color: d.color,
    bgColor: d.bgColor,
  }));

  const sidebarMembers = workspace.members.map((m) => ({
    userId: m.userId,
    user: {
      id: m.user.id,
      name: m.user.name,
      initials: m.user.initials,
      role: m.user.role,
    },
  }));

  const sidebarProjects = workspace.projects.map((p) => ({
    id: p.id,
    name: p.name,
    color: p.color,
    _count: { tasks: p._count.tasks },
  }));

  return (
    <WorkspaceLayoutClient
      workspaceId={workspace.id}
      workspaceName={workspace.name}
      members={sidebarMembers}
      projects={sidebarProjects}
      departments={sidebarDepartments}
    >
      {children}
    </WorkspaceLayoutClient>
  );
}
