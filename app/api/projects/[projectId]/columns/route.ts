import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { projectId } = await params;

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
    return NextResponse.json({ error: "No tienes acceso" }, { status: 403 });
  }

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
