"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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

export async function addMember(workspaceId: string, userId: string, role: string = "member") {
  await prisma.workspaceMember.create({
    data: { workspaceId, userId, role },
  });
  revalidatePath(`/workspace/${workspaceId}`);
}

export async function removeMember(workspaceId: string, userId: string) {
  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  revalidatePath(`/workspace/${workspaceId}`);
}
