import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FinanceAnalyticsService, ReportFilters } from "@/lib/services/finance-analytics.service";
import { z } from "zod";

const filtersSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  projectId: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { workspaceId } = await params;

    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId: session.user.id } },
    });
    if (!membership) {
      return NextResponse.json(
        { error: "No tienes acceso a este workspace" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const parsed = filtersSchema.safeParse({
      dateFrom: searchParams.get("dateFrom") ?? undefined,
      dateTo: searchParams.get("dateTo") ?? undefined,
      accountId: searchParams.get("accountId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      projectId: searchParams.get("projectId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Filtros inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = await FinanceAnalyticsService.getReports(
      workspaceId,
      parsed.data as ReportFilters
    );
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /finance/reports]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
