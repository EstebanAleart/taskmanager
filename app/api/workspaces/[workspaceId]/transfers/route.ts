import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// Obtiene o crea la categoría de sistema "Transferencia" para el workspace
async function getOrCreateTransferCategory(workspaceId: string, type: "income" | "expense") {
  const existing = await prisma.transactionCategory.findFirst({
    where: { workspaceId, name: "Transferencia", type },
  });
  if (existing) return existing;
  return prisma.transactionCategory.create({
    data: {
      name: "Transferencia",
      type,
      color: "text-blue-500",
      workspaceId,
    },
  });
}

/**
 * POST /api/workspaces/[workspaceId]/transfers
 * Body: {
 *   fromAccountId: string
 *   toAccountId: string
 *   amount: number          — monto en moneda de la cuenta origen
 *   rate: number            — tasa de conversión (toAmount = amount * rate). 1 si misma moneda
 *   description?: string
 *   date?: string           — ISO date string
 * }
 *
 * Crea dos transacciones:
 *   - Egreso en fromAccount por `amount`
 *   - Ingreso en toAccount por `amount * rate`
 * Actualiza ambos balances de forma atómica.
 */
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
    const { fromAccountId, toAccountId, amount, rate = 1, description, date } = body;

    if (!fromAccountId || !toAccountId || amount === undefined || amount <= 0) {
      return NextResponse.json(
        { error: "Cuenta origen, cuenta destino y monto son requeridos." },
        { status: 400 }
      );
    }

    if (fromAccountId === toAccountId) {
      return NextResponse.json(
        { error: "Las cuentas origen y destino deben ser distintas." },
        { status: 400 }
      );
    }

    const [fromAccount, toAccount] = await Promise.all([
      prisma.financialAccount.findFirst({ where: { id: fromAccountId, workspaceId } }),
      prisma.financialAccount.findFirst({ where: { id: toAccountId, workspaceId } }),
    ]);

    if (!fromAccount) {
      return NextResponse.json({ error: "Cuenta origen no encontrada." }, { status: 404 });
    }
    if (!toAccount) {
      return NextResponse.json({ error: "Cuenta destino no encontrada." }, { status: 404 });
    }

    const toAmount = Math.round(amount * rate * 100) / 100;
    const txDate = date ? new Date(date) : new Date();
    const desc = description?.trim() || `Transferencia ${fromAccount.name} → ${toAccount.name}`;

    // Categorías de sistema para transferencias
    const [expenseCat, incomeCat] = await Promise.all([
      getOrCreateTransferCategory(workspaceId, "expense"),
      getOrCreateTransferCategory(workspaceId, "income"),
    ]);

    // Crear las 2 transacciones — el balance se computa dinámicamente en GET /accounts
    const [debitTxn, creditTxn] = await prisma.$transaction([
      // Egreso en cuenta origen
      prisma.financialTransaction.create({
        data: {
          amount,
          description: `${desc} (salida)`,
          date: txDate,
          workspaceId,
          accountId: fromAccountId,
          categoryId: expenseCat.id,
          createdById: session.user.id,
        },
        include: {
          account: true,
          category: true,
          project: { select: { id: true, name: true, color: true } },
          createdBy: { select: { id: true, name: true, initials: true } },
          attachments: true,
        },
      }),
      // Ingreso en cuenta destino
      prisma.financialTransaction.create({
        data: {
          amount: toAmount,
          description: `${desc} (entrada)`,
          date: txDate,
          workspaceId,
          accountId: toAccountId,
          categoryId: incomeCat.id,
          createdById: session.user.id,
        },
        include: {
          account: true,
          category: true,
          project: { select: { id: true, name: true, color: true } },
          createdBy: { select: { id: true, name: true, initials: true } },
          attachments: true,
        },
      }),
    ]);

    return NextResponse.json({ debit: debitTxn, credit: creditTxn }, { status: 201 });
  } catch (error) {
    console.error("[POST /transfers]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
