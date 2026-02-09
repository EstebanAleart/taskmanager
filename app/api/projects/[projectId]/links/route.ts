import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const body = await request.json();
  const { title, url } = body;

  if (!title?.trim() || !url?.trim()) {
    return NextResponse.json({ error: "Titulo y URL son requeridos." }, { status: 400 });
  }

  const link = await prisma.projectLink.create({
    data: { title: title.trim(), url: url.trim(), projectId },
  });

  return NextResponse.json(link, { status: 201 });
}
