import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

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
