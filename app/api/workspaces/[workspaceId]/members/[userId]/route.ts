import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; userId: string }> }
) {
  const { workspaceId, userId } = await params;

  await prisma.workspaceMember.delete({
    where: { workspaceId_userId: { workspaceId, userId } },
  });

  return NextResponse.json({ success: true });
}
