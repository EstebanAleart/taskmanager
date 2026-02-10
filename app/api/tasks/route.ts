import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { projectId, title, description, priorityId, columnId, assigneeId, dueDate, tags } = body;

  if (!projectId || !title?.trim() || !priorityId || !columnId || !assigneeId) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true },
  });
  if (!project) {
    return NextResponse.json({ error: "Proyecto no encontrado" }, { status: 404 });
  }

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: project.workspaceId, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "No tienes acceso a este proyecto" }, { status: 403 });
  }

  const task = await prisma.task.create({
    data: {
      title: title.trim(),
      description: description?.trim() || "",
      priorityId,
      columnId,
      projectId,
      assigneeId,
      dueDate: dueDate ? new Date(dueDate) : null,
      tags: tags?.length
        ? {
            connectOrCreate: tags.map((tag: string) => ({
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

  return NextResponse.json(task, { status: 201 });
}
