import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; transactionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId, transactionId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
    }

    const oldTxn = await prisma.financialTransaction.findFirst({
      where: { id: transactionId, workspaceId },
    });
    if (!oldTxn) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
    }

    const body = await request.json();
    const { amount, description, date, accountId, categoryId, projectId } = body;

    const data: Record<string, unknown> = {};
    if (amount !== undefined) data.amount = amount;
    if (description !== undefined) data.description = description.trim();
    if (date !== undefined) data.date = new Date(date);
    if (accountId !== undefined) data.accountId = accountId;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (projectId !== undefined) data.projectId = projectId || null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No hay campos para actualizar." }, { status: 400 });
    }

    // El balance se computa dinámicamente en GET /accounts desde todas las transacciones
    const updated = await prisma.financialTransaction.update({
      where: { id: transactionId },
      data,
      include: {
        account: true,
        category: true,
        project: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true, initials: true } },
        attachments: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[PATCH /transactions/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; transactionId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId, transactionId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
    }

    const txn = await prisma.financialTransaction.findFirst({
      where: { id: transactionId, workspaceId },
    });
    if (!txn) {
      return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
    }

    // El balance se recomputa en GET /accounts; solo eliminamos la transacción
    await prisma.financialTransaction.delete({ where: { id: transactionId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /transactions/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
