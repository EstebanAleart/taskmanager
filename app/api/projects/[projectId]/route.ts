import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  await prisma.$transaction([
    prisma.task.deleteMany({ where: { projectId } }),
    prisma.taskColumn.deleteMany({ where: { projectId } }),
    prisma.priorityLevel.deleteMany({ where: { projectId } }),
    prisma.projectLink.deleteMany({ where: { projectId } }),
    prisma.projectMember.deleteMany({ where: { projectId } }),
    prisma.project.delete({ where: { id: projectId } }),
  ]);

  return NextResponse.json({ success: true });
}
