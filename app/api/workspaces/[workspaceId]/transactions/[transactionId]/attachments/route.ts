import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; transactionId: string }> }
) {
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

  const transaction = await prisma.financialTransaction.findFirst({
    where: { id: transactionId, workspaceId },
  });
  if (!transaction) {
    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
  }

  const attachments = await prisma.transactionAttachment.findMany({
    where: { transactionId },
    orderBy: { uploadedAt: "desc" },
  });

  return NextResponse.json(attachments);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; transactionId: string }> }
) {
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

  const transaction = await prisma.financialTransaction.findFirst({
    where: { id: transactionId, workspaceId },
  });
  if (!transaction) {
    return NextResponse.json({ error: "Transacción no encontrada" }, { status: 404 });
  }

  const body = await request.json();
  const { url, name } = body;

  if (!url?.trim() || !name?.trim()) {
    return NextResponse.json({ error: "URL y nombre son requeridos." }, { status: 400 });
  }

  const attachment = await prisma.transactionAttachment.create({
    data: {
      url: url.trim(),
      name: name.trim(),
      transactionId,
    },
  });

  return NextResponse.json(attachment, { status: 201 });
}
