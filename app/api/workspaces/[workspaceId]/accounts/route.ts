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

    const accounts = await prisma.financialAccount.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error("[GET /accounts]", error);
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
    const { name, description, currency, balance } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 });
    }

    const account = await prisma.financialAccount.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        currency: currency?.trim() || "ARS",
        balance: balance ?? 0,
        workspaceId,
      },
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error("[POST /accounts]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
