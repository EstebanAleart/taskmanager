import { notFound } from "next/navigation";
import { getProject } from "@/lib/actions/project";
import { getProjectMembers } from "@/lib/actions/task";
import { ProjectContent } from "@/components/project/project-content";

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

  const serializedLinks = project.links.map((l) => ({
    id: l.id,
    title: l.title,
    url: l.url,
  }));

  return (
    <ProjectContent
      projectId={projectId}
      workspaceId={workspaceId}
      projectName={project.name}
      projectColor={project.color}
      department={{
        label: project.department.label,
        color: project.department.color,
        bgColor: project.department.bgColor,
      }}
      taskCount={project.tasks.length}
      notes={project.notes}
      links={serializedLinks}
      tasks={serializedTasks}
      columns={project.columns}
      priorities={project.priorities}
      users={userOptions}
      hasUsers={users.length > 0}
    />
  );
}
