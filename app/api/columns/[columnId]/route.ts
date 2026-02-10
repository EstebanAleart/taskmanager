import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ columnId: string }> }
) {
  const { columnId } = await params;
  const body = await request.json();
  const { label } = body;

  if (!label?.trim()) {
    return NextResponse.json({ error: "Label es requerido." }, { status: 400 });
  }

  const column = await prisma.taskColumn.update({
    where: { id: columnId },
    data: { label: label.trim() },
  });

  return NextResponse.json(column);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ columnId: string }> }
) {
  const { columnId } = await params;
  const { searchParams } = new URL(request.url);
  const moveToColumnId = searchParams.get("moveTo");

  if (!moveToColumnId) {
    return NextResponse.json({ error: "moveTo es requerido." }, { status: 400 });
  }

  await prisma.task.updateMany({
    where: { columnId },
    data: { columnId: moveToColumnId },
  });

  await prisma.taskColumn.delete({ where: { id: columnId } });

  return NextResponse.json({ success: true });
}
