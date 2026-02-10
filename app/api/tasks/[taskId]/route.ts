import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
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
  const { taskId } = await params;

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ success: true });
}
