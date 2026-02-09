"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addLink(workspaceId: string, title: string, url: string) {
  const link = await prisma.workspaceLink.create({
    data: { title, url, workspaceId },
  });
  revalidatePath(`/workspace/${workspaceId}`);
  return link;
}

export async function deleteLink(id: string, workspaceId: string) {
  await prisma.workspaceLink.delete({ where: { id } });
  revalidatePath(`/workspace/${workspaceId}`);
}
