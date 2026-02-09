"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const DEFAULT_COLUMNS = [
  { name: "pendiente", label: "Pendiente", color: "text-muted-foreground", icon: "circle", order: 0 },
  { name: "en_progreso", label: "En Progreso", color: "text-blue-400", icon: "loader", order: 1 },
  { name: "revision", label: "En Revision", color: "text-amber-400", icon: "eye", order: 2 },
  { name: "completada", label: "Completada", color: "text-emerald-400", icon: "check", order: 3 },
];

const DEFAULT_PRIORITIES = [
  { name: "urgente", label: "Urgente", color: "text-red-400", bgColor: "bg-red-500/15", dotColor: "bg-red-500", order: 0 },
  { name: "alta", label: "Alta", color: "text-orange-400", bgColor: "bg-orange-500/15", dotColor: "bg-orange-500", order: 1 },
  { name: "media", label: "Media", color: "text-yellow-400", bgColor: "bg-yellow-500/15", dotColor: "bg-yellow-500", order: 2 },
  { name: "baja", label: "Baja", color: "text-blue-400", bgColor: "bg-blue-500/15", dotColor: "bg-blue-400", order: 3 },
];

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

export async function createProject(
  workspaceId: string,
  data: { name: string; description: string; departmentId: string; color: string }
) {
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      departmentId: data.departmentId,
      workspaceId,
      color: data.color,
      columns: {
        create: DEFAULT_COLUMNS,
      },
      priorities: {
        create: DEFAULT_PRIORITIES,
      },
    },
  });
  revalidatePath(`/workspace/${workspaceId}`);
  return project;
}

export async function deleteProject(id: string, workspaceId: string) {
  await prisma.project.delete({ where: { id } });
  revalidatePath(`/workspace/${workspaceId}`);
}

export async function updateProjectNotes(projectId: string, notes: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  await prisma.project.update({
    where: { id: projectId },
    data: { notes },
  });
  if (project) {
    revalidatePath(`/workspace/${project.workspaceId}/project/${projectId}`);
  }
}

export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
}
