import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await request.json();
  const { notes } = body;

  await prisma.project.update({
    where: { id: projectId },
    data: { notes: notes ?? "" },
  });

  return NextResponse.json({ success: true });
}
