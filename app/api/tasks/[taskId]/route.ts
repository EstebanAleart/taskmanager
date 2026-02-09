import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  const body = await request.json();
  const { columnId } = body;

  if (!columnId) {
    return NextResponse.json({ error: "columnId es requerido." }, { status: 400 });
  }

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { columnId },
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
