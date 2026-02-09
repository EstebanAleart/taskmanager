"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addLink(projectId: string, title: string, url: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  const link = await prisma.projectLink.create({
    data: { title, url, projectId },
  });
  if (project) {
    revalidatePath(`/workspace/${project.workspaceId}/project/${projectId}`);
  }
  return link;
}

export async function deleteLink(id: string, projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  await prisma.projectLink.delete({ where: { id } });
  if (project) {
    revalidatePath(`/workspace/${project.workspaceId}/project/${projectId}`);
  }
}
