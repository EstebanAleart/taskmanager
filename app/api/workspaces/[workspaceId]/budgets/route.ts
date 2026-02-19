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

    const budgets = await prisma.budget.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(budgets);
  } catch (error) {
    console.error("[GET /budgets]", error);
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
    const { name, amount, description } = body;

    if (!name?.trim() || amount === undefined) {
      return NextResponse.json({ error: "Nombre y monto son requeridos." }, { status: 400 });
    }

    const budget = await prisma.budget.create({
      data: {
        name: name.trim(),
        amount,
        description: description?.trim() || "",
        workspaceId,
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("[POST /budgets]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
