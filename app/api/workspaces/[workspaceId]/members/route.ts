import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

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
  const { userId, role = "member" } = body;

  if (!userId) {
    return NextResponse.json({ error: "userId es requerido." }, { status: 400 });
  }

  const member = await prisma.workspaceMember.create({
    data: { workspaceId, userId, role },
  });

  return NextResponse.json(member, { status: 201 });
}
