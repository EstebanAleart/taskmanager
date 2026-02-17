import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
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

  const categories = await prisma.transactionCategory.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(categories);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
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
  const { name, type, color } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 });
  }
  if (!type || !["income", "expense"].includes(type)) {
    return NextResponse.json({ error: "El tipo debe ser 'income' o 'expense'." }, { status: 400 });
  }

  const category = await prisma.transactionCategory.create({
    data: {
      name: name.trim(),
      type,
      color: color?.trim() || "",
      workspaceId,
    },
  });

  return NextResponse.json(category, { status: 201 });
}
