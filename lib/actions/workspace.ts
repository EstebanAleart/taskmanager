"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function createWorkspace(data: { name: string; description: string }) {
  const workspace = await prisma.workspace.create({
    data: {
      name: data.name,
      description: data.description,
    },
  });
  revalidatePath("/dashboard");
  return workspace;
}

export async function deleteWorkspace(id: string) {
  await prisma.workspace.delete({ where: { id } });
  revalidatePath("/dashboard");
}
