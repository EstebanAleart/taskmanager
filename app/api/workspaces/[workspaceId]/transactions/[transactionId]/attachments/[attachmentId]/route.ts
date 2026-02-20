import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; transactionId: string; attachmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId, transactionId, attachmentId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json({ error: "No tienes acceso a este workspace" }, { status: 403 });
    }

    const attachment = await prisma.transactionAttachment.findFirst({
      where: {
        id: attachmentId,
        transactionId,
        transaction: { workspaceId },
      },
    });
    if (!attachment) {
      return NextResponse.json({ error: "Adjunto no encontrado" }, { status: 404 });
    }

    await prisma.transactionAttachment.delete({ where: { id: attachmentId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /attachments/:id]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
