import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
    }

    const transactions = await prisma.financialTransaction.findMany({
      where: { workspaceId },
      include: {
        account: true,
        category: true,
        project: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true, initials: true } },
        attachments: true,
      },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("[GET /transactions]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
    }

    const body = await request.json();
    const { amount, description, date, accountId, categoryId, projectId } = body;

    if (amount === undefined || !accountId || !categoryId) {
      return NextResponse.json({ error: "Monto, cuenta y categoría son requeridos." }, { status: 400 });
    }

    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, workspaceId },
    });
    if (!account) {
      return NextResponse.json({ error: "Cuenta no encontrada en este workspace" }, { status: 404 });
    }

    const category = await prisma.transactionCategory.findFirst({
      where: { id: categoryId, workspaceId },
    });
    if (!category) {
      return NextResponse.json({ error: "Categoría no encontrada en este workspace" }, { status: 404 });
    }

    // El balance de la cuenta se computa dinámicamente desde las transacciones en GET /accounts
    const transaction = await prisma.financialTransaction.create({
      data: {
        amount,
        description: description?.trim() || "",
        date: date ? new Date(date) : new Date(),
        workspaceId,
        accountId,
        categoryId,
        projectId: projectId || null,
        createdById: session.user.id,
      },
      include: {
        account: true,
        category: true,
        project: { select: { id: true, name: true, color: true } },
        createdBy: { select: { id: true, name: true, initials: true } },
        attachments: true,
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("[POST /transactions]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
