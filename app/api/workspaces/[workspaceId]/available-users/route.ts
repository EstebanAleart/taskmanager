import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const { workspaceId } = await params;

  const currentMembers = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    select: { userId: true },
  });
  const memberIds = currentMembers.map((m) => m.userId);

  const users = await prisma.user.findMany({
    where: { id: { notIn: memberIds } },
    include: { department: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
}
