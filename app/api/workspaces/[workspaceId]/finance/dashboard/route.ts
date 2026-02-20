import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { FinanceAnalyticsService } from "@/lib/services/finance-analytics.service";

export async function GET(
  _req: NextRequest,
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

    const data = await FinanceAnalyticsService.getDashboard(workspaceId);
    return NextResponse.json(data);
  } catch (error) {
    console.error("[GET /finance/dashboard]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
