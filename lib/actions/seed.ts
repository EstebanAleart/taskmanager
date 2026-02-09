"use server";

import { prisma } from "@/lib/prisma";

export async function seedDatabase() {
  // Check if already seeded
  const existingDepts = await prisma.department.count();
  if (existingDepts > 0) {
    return { success: false, message: "La base de datos ya tiene datos." };
  }

  // Departments
  const departments = await Promise.all([
    prisma.department.create({
      data: { name: "desarrollo", label: "Desarrollo", color: "text-blue-400", bgColor: "bg-blue-500/15" },
    }),
    prisma.department.create({
      data: { name: "data", label: "Data", color: "text-emerald-400", bgColor: "bg-emerald-500/15" },
    }),
    prisma.department.create({
      data: { name: "marketing", label: "Marketing", color: "text-amber-400", bgColor: "bg-amber-500/15" },
    }),
    prisma.department.create({
      data: { name: "branding", label: "Branding", color: "text-pink-400", bgColor: "bg-pink-500/15" },
    }),
    prisma.department.create({
      data: { name: "n8n", label: "N8N", color: "text-orange-400", bgColor: "bg-orange-500/15" },
    }),
  ]);

  const deptMap: Record<string, string> = {};
  for (const d of departments) {
    deptMap[d.name] = d.id;
  }

  // File Types
  await Promise.all([
    prisma.fileType.create({
      data: { name: "pdf", label: "PDF", color: "text-red-500", bgColor: "bg-red-500/10", extension: "PDF" },
    }),
    prisma.fileType.create({
      data: { name: "image", label: "Imagen", color: "text-emerald-500", bgColor: "bg-emerald-500/10", extension: "IMG" },
    }),
    prisma.fileType.create({
      data: { name: "doc", label: "Documento", color: "text-blue-500", bgColor: "bg-blue-500/10", extension: "DOC" },
    }),
    prisma.fileType.create({
      data: { name: "spreadsheet", label: "Planilla", color: "text-green-600", bgColor: "bg-green-500/10", extension: "XLS" },
    }),
    prisma.fileType.create({
      data: { name: "video", label: "Video", color: "text-purple-500", bgColor: "bg-purple-500/10", extension: "VID" },
    }),
    prisma.fileType.create({
      data: { name: "other", label: "Otro", color: "text-muted-foreground", bgColor: "bg-muted", extension: "FILE" },
    }),
  ]);

  // Users
  await Promise.all([
    prisma.user.create({
      data: { name: "Esteban A.", avatar: "", role: "Developer", departmentId: deptMap["desarrollo"], initials: "EA" },
    }),
    prisma.user.create({
      data: { name: "Ezequiel B.", avatar: "", role: "Data Analyst", departmentId: deptMap["data"], initials: "EB" },
    }),
    prisma.user.create({
      data: { name: "Mariano B.", avatar: "", role: "Automation Manager", departmentId: deptMap["n8n"], initials: "MBog" },
    }),
    prisma.user.create({
      data: { name: "Mauricio B.", avatar: "", role: "Marketing Manager", departmentId: deptMap["marketing"], initials: "MBou" },
    }),
    prisma.user.create({
      data: { name: "Sofia R.", avatar: "", role: "Brand Strategist", departmentId: deptMap["branding"], initials: "SR" },
    }),
  ]);

  return { success: true, message: "Base de datos inicializada correctamente." };
}
