import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, description } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "El nombre es requerido." }, { status: 400 });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: name.trim(),
      description: description?.trim() || "",
    },
  });

  return NextResponse.json(workspace, { status: 201 });
}
