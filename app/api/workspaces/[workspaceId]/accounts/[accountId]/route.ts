import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; accountId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId, accountId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
    }

    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, currency, balance } = body;

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name.trim();
    if (description !== undefined) data.description = description.trim();
    if (currency !== undefined) data.currency = currency.trim();
    if (balance !== undefined) data.balance = balance;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar." }, { status: 400 });
    }

    const updated = await prisma.financialAccount.update({
      where: { id: accountId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /accounts/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; accountId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId, accountId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
    }

    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) {
      return NextResponse.json({ error: "Cuenta no encontrada" }, { status: 404 });
    }

    await prisma.financialAccount.delete({ where: { id: accountId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /accounts/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
