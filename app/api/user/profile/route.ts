import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      department: true,
      workspaces: {
        include: {
          workspace: {
            include: {
              _count: { select: { projects: true, members: true } },
            },
          },
        },
        orderBy: { joinedAt: "desc" },
      },
      projects: { select: { projectId: true } },
      assignedTasks: {
        select: {
          id: true,
          column: { select: { name: true } },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
  });

  const tasksByStatus: Record<string, number> = {};
  for (const task of user.assignedTasks) {
    const status = task.column.name;
    tasksByStatus[status] = (tasksByStatus[status] || 0) + 1;
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    initials: user.initials,
    status: user.status,
    avatar: user.avatar,
    department: user.department,
    workspaces: user.workspaces.map((wm) => ({
      id: wm.workspace.id,
      name: wm.workspace.name,
      description: wm.workspace.description,
      role: wm.role,
      joinedAt: wm.joinedAt,
      projectCount: wm.workspace._count.projects,
      memberCount: wm.workspace._count.members,
    })),
    stats: {
      totalWorkspaces: user.workspaces.length,
      totalProjects: user.projects.length,
      totalTasks: user.assignedTasks.length,
      tasksByStatus,
    },
    departments,
  });
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json();
  const { name, initials, departmentId } = body;

  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "El nombre no puede estar vacío" }, { status: 400 });
  }

  if (departmentId) {
    const dept = await prisma.department.findUnique({ where: { id: departmentId } });
    if (!dept) {
      return NextResponse.json({ error: "Departamento no encontrado" }, { status: 400 });
    }
  }

  const data: Record<string, string> = {};
  if (name) data.name = name.trim();
  if (initials) data.initials = initials.trim().toUpperCase().slice(0, 4);
  if (departmentId) data.departmentId = departmentId;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    include: { department: true },
  });

  return NextResponse.json(updated);
}
