import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;
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
