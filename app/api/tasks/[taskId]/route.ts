import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

async function verifyTaskAccess(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { project: { select: { workspaceId: true } } },
  });
  if (!task) return null;

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: task.project.workspaceId, userId } },
  });
  return membership ? task : null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { taskId } = await params;

  const access = await verifyTaskAccess(taskId, session.user.id);
  if (!access) {
    return NextResponse.json({ error: "No tienes acceso a esta tarea" }, { status: 403 });
  }

  const body = await request.json();
  const { title, description, columnId, priorityId, assigneeId, dueDate, tags } = body;

  const data: Record<string, unknown> = {};
  if (title !== undefined) data.title = title;
  if (description !== undefined) data.description = description;
  if (columnId !== undefined) data.columnId = columnId;
  if (priorityId !== undefined) data.priorityId = priorityId;
  if (assigneeId !== undefined) data.assigneeId = assigneeId;
  if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

  if (Object.keys(data).length === 0 && tags === undefined) {
    return NextResponse.json({ error: "No hay campos para actualizar." }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...data,
      ...(tags !== undefined && {
        tags: {
          set: [],
          connectOrCreate: (tags as string[]).map((name: string) => ({
            where: { name },
            create: { name },
          })),
        },
      }),
    },
    include: {
      assignee: { include: { department: true } },
      column: true,
      priority: true,
      tags: true,
    },
  });

  return NextResponse.json(task);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { taskId } = await params;

  const access = await verifyTaskAccess(taskId, session.user.id);
  if (!access) {
    return NextResponse.json({ error: "No tienes acceso a esta tarea" }, { status: 403 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true });
}
