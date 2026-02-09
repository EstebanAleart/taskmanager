import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_COLUMNS = [
  { name: "pendiente", label: "Pendiente", color: "text-muted-foreground", icon: "circle", order: 0 },
  { name: "en_progreso", label: "En Progreso", color: "text-blue-400", icon: "loader", order: 1 },
  { name: "revision", label: "En Revision", color: "text-amber-400", icon: "eye", order: 2 },
  { name: "completada", label: "Completada", color: "text-emerald-400", icon: "check", order: 3 },
];

const DEFAULT_PRIORITIES = [
  { name: "urgente", label: "Urgente", color: "text-red-400", bgColor: "bg-red-500/15", dotColor: "bg-red-500", order: 0 },
  { name: "alta", label: "Alta", color: "text-orange-400", bgColor: "bg-orange-500/15", dotColor: "bg-orange-500", order: 1 },
  { name: "media", label: "Media", color: "text-yellow-400", bgColor: "bg-yellow-500/15", dotColor: "bg-yellow-500", order: 2 },
  { name: "baja", label: "Baja", color: "text-blue-400", bgColor: "bg-blue-500/15", dotColor: "bg-blue-400", order: 3 },
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { workspaceId, name, description, departmentIds, color } = body;

  if (!workspaceId || !name?.trim() || !departmentIds?.length || !color) {
    return NextResponse.json({ error: "Faltan campos requeridos." }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || "",
      workspaceId,
      color,
      departments: { connect: (departmentIds as string[]).map((id) => ({ id })) },
      columns: { create: DEFAULT_COLUMNS },
      priorities: { create: DEFAULT_PRIORITIES },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
