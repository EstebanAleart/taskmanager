import { notFound } from "next/navigation";
import {
  getWorkspace,
  getDepartments,
  getWorkspaceStats,
  getWorkspaceTasksByDepartment,
} from "@/lib/queries";
import { WorkspaceContent } from "@/components/workspace/workspace-content";

interface WorkspacePageProps {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ section?: string; dept?: string }>;
}

export default async function WorkspacePage({
  params,
  searchParams,
}: WorkspacePageProps) {
  const { workspaceId } = await params;
  const { section, dept } = await searchParams;
  const workspace = await getWorkspace(workspaceId);

  if (!workspace) {
    notFound();
  }

  const departments = await getDepartments();
  const activeSection = section || "proyectos";

  // Fetch report data when on reportes section
  let reportProjects = null;
  if (activeSection === "reportes") {
    const projects = await getWorkspaceStats(workspaceId);
    reportProjects = projects.map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      departments: p.departments,
      tasks: p.tasks.map((t) => ({
        id: t.id,
        columnId: t.columnId,
        dueDate: t.dueDate ? t.dueDate.toISOString() : null,
        column: { name: t.column.name },
        priority: { name: t.priority.name },
      })),
    }));
  }

  // Fetch sector data when filtering by department
  let sectorData = null;
  if (activeSection === "sector" && dept) {
    const deptInfo = departments.find((d) => d.id === dept);
    if (deptInfo) {
      const tasks = await getWorkspaceTasksByDepartment(workspaceId, dept);
      sectorData = {
        department: {
          id: deptInfo.id,
          name: deptInfo.name,
          label: deptInfo.label,
          color: deptInfo.color,
          bgColor: deptInfo.bgColor,
        },
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          dueDate: t.dueDate ? t.dueDate.toISOString() : null,
          createdAt: t.createdAt.toISOString(),
          column: { name: t.column.name, label: t.column.label, color: t.column.color },
          priority: {
            name: t.priority.name,
            label: t.priority.label,
            color: t.priority.color,
            dotColor: t.priority.dotColor,
          },
          assignee: {
            id: t.assignee.id,
            name: t.assignee.name,
            initials: t.assignee.initials,
            department: {
              label: t.assignee.department.label,
              color: t.assignee.department.color,
              bgColor: t.assignee.department.bgColor,
            },
          },
          project: {
            id: t.project.id,
            name: t.project.name,
            color: t.project.color,
            departments: t.project.departments.map((d) => ({ label: d.label })),
          },
          tags: t.tags,
        })),
      };
    }
  }

  return (
    <WorkspaceContent
      workspace={workspace}
      departments={departments}
      activeSection={activeSection}
      reportProjects={reportProjects}
      sectorData={sectorData}
    />
  );
}
