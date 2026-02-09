import { prisma } from "@/lib/prisma";

export async function getWorkspaces() {
  return prisma.workspace.findMany({
    include: {
      _count: { select: { members: true, projects: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getWorkspace(id: string) {
  return prisma.workspace.findUnique({
    where: { id },
    include: {
      members: {
        include: { user: { include: { department: true } } },
        orderBy: { joinedAt: "asc" },
      },
      projects: {
        include: {
          department: true,
          _count: { select: { tasks: true, members: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getProject(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      department: true,
      workspace: true,
      links: { orderBy: { createdAt: "desc" } },
      columns: { orderBy: { order: "asc" } },
      priorities: { orderBy: { order: "asc" } },
      tasks: {
        include: {
          assignee: { include: { department: true } },
          column: true,
          priority: true,
          tags: true,
        },
        orderBy: { createdAt: "desc" },
      },
      members: {
        include: { user: { include: { department: true } } },
      },
    },
  });
}

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}

export async function getDepartmentCount() {
  return prisma.department.count();
}

export async function getProjectMembers(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      workspace: {
        include: {
          members: {
            include: { user: { include: { department: true } } },
          },
        },
      },
    },
  });
  return project?.workspace.members.map((m) => m.user) ?? [];
}

export async function getAvailableUsers(workspaceId: string) {
  const currentMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  const memberIds = currentMembers.map((m) => m.userId);

  return prisma.user.findMany({
    where: { id: { notIn: memberIds } },
    include: { department: true },
    orderBy: { name: "asc" },
  });
}
