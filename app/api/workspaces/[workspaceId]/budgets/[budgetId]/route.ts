import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; budgetId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { workspaceId, budgetId } = await params;

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
  }

  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, workspaceId },
  });
  if (!budget) {
    return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const { name, amount, description } = body;

  const data: Record<string, unknown> = {};
  if (name !== undefined) data.name = name.trim();
  if (amount !== undefined) data.amount = amount;
  if (description !== undefined) data.description = description.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No hay campos para actualizar." }, { status: 400 });
  }

  const updated = await prisma.budget.update({
    where: { id: budgetId },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; budgetId: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { workspaceId, budgetId } = await params;

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
  });
  if (!membership) {
    return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
  }

  const budget = await prisma.budget.findFirst({
    where: { id: budgetId, workspaceId },
  });
  if (!budget) {
    return NextResponse.json({ error: "Presupuesto no encontrado" }, { status: 404 });
  }

  await prisma.budget.delete({ where: { id: budgetId } });

  return NextResponse.json({ success: true });
}
