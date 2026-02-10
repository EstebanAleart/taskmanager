import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { workspaceId } = await params;

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
  }

  // Get all project IDs in this workspace
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    select: { id: true },
  });
  const projectIds = projects.map((p) => p.id);

  await prisma.$transaction([
    // Delete tasks in all projects
    prisma.task.deleteMany({ where: { projectId: { in: projectIds } } }),
    // Delete task columns and priorities
    prisma.taskColumn.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.priorityLevel.deleteMany({ where: { projectId: { in: projectIds } } }),
    // Delete project links and members
    prisma.projectLink.deleteMany({ where: { projectId: { in: projectIds } } }),
    prisma.projectMember.deleteMany({ where: { projectId: { in: projectIds } } }),
    // Delete projects
    prisma.project.deleteMany({ where: { workspaceId } }),
    // Delete workspace members
    prisma.workspaceMember.deleteMany({ where: { workspaceId } }),
    // Delete workspace
    prisma.workspace.delete({ where: { id: workspaceId } }),
  ]);

  return NextResponse.json({ success: true });
}
