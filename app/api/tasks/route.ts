import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, title, description, priorityId, columnId, assigneeId, dueDate, tags } = body;

  if (!projectId || !title?.trim() || !priorityId || !columnId || !assigneeId) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
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
