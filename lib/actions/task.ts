"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTask(
  projectId: string,
  data: {
    title: string;
    description: string;
    priorityId: string;
    columnId: string;
    assigneeId: string;
    dueDate?: string;
    tags?: string[];
  }
) {
  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description,
      priorityId: data.priorityId,
      columnId: data.columnId,
      projectId,
      assigneeId: data.assigneeId,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      tags: data.tags?.length
        ? {
            connectOrCreate: data.tags.map((tag) => ({
              where: { name: tag },
              create: { name: tag },
            })),
          }
        : undefined,
    },
    include: {
      assignee: { include: { department: true } },
      column: true,
      priority: true,
      tags: true,
    },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (project) {
    revalidatePath(`/workspace/${project.workspaceId}/project/${projectId}`);
  }

  return task;
}

export async function moveTask(id: string, columnId: string) {
  const task = await prisma.task.update({
    where: { id },
    data: { columnId },
    include: { project: { select: { workspaceId: true, id: true } } },
  });
  revalidatePath(`/workspace/${task.project.workspaceId}/project/${task.project.id}`);
  return task;
}

export async function deleteTask(id: string) {
  const task = await prisma.task.delete({
    where: { id },
    include: { project: { select: { workspaceId: true, id: true } } },
  });
  revalidatePath(`/workspace/${task.project.workspaceId}/project/${task.project.id}`);
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

export async function addColumn(projectId: string, name: string, label: string, color: string, icon: string) {
  const maxOrder = await prisma.taskColumn.aggregate({
    where: { projectId },
    _max: { order: true },
  });
  const column = await prisma.taskColumn.create({
    data: {
      name,
      label,
      color,
      icon,
      order: (maxOrder._max.order ?? -1) + 1,
      projectId,
    },
  });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (project) {
    revalidatePath(`/workspace/${project.workspaceId}/project/${projectId}`);
  }

  return column;
}

export async function deleteColumn(columnId: string, moveToColumnId: string) {
  // Move tasks to another column before deleting
  await prisma.task.updateMany({
    where: { columnId },
    data: { columnId: moveToColumnId },
  });

  const column = await prisma.taskColumn.delete({
    where: { id: columnId },
    include: { project: { select: { workspaceId: true, id: true } } },
  });
  revalidatePath(`/workspace/${column.project.workspaceId}/project/${column.project.id}`);
}

export async function renameColumn(columnId: string, newLabel: string) {
  const column = await prisma.taskColumn.update({
    where: { id: columnId },
    data: { label: newLabel },
    include: { project: { select: { workspaceId: true, id: true } } },
  });
  revalidatePath(`/workspace/${column.project.workspaceId}/project/${column.project.id}`);
}
