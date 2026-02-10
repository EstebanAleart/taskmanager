import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await request.json();
  const { name, label, color, icon } = body;

  if (!label?.trim()) {
    return NextResponse.json({ error: "Label es requerido." }, { status: 400 });
  }

  const maxOrder = await prisma.taskColumn.aggregate({
    where: { projectId },
    _max: { order: true },
  });

  const column = await prisma.taskColumn.create({
    data: {
      name: name || label.toLowerCase().replace(/\s+/g, "_"),
      label: label.trim(),
      color: color || "",
      icon: icon || "circle",
      order: (maxOrder._max.order ?? -1) + 1,
      projectId,
    },
  });

  return NextResponse.json(column, { status: 201 });
}
