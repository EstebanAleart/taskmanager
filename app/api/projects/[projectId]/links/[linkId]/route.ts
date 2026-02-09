import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; linkId: string }> }
) {
  const { linkId } = await params;

  await prisma.projectLink.delete({ where: { id: linkId } });

  return NextResponse.json({ success: true });
}
