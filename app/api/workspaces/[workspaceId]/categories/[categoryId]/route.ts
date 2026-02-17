import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { workspaceId, categoryId } = await params;

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
  }

  const category = await prisma.transactionCategory.findFirst({
    where: { id: categoryId, workspaceId },
  });
  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const { name, type, color } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (type !== undefined) {
    if (!["income", "expense"].includes(type)) {
      return NextResponse.json({ error: "El tipo debe ser 'income' o 'expense'." }, { status: 400 });
    }
    data.type = type;
  }
  if (color !== undefined) data.color = color.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar." }, { status: 400 });
  }

  const updated = await prisma.transactionCategory.update({
    where: { id: categoryId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; categoryId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { workspaceId, categoryId } = await params;

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
  }

  const category = await prisma.transactionCategory.findFirst({
    where: { id: categoryId, workspaceId },
  });
  if (!category) {
    return NextResponse.json({ error: "Categoría no encontrada" }, { status: 404 });
  }

  await prisma.transactionCategory.delete({ where: { id: categoryId } });

  return NextResponse.json({ success: true });
}
