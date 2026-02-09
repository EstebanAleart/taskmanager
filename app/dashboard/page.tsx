import Link from "next/link";
import { LayoutDashboard } from "lucide-react";
import { getWorkspaces } from "@/lib/actions/workspace";
import { prisma } from "@/lib/prisma";
import { DashboardClient } from "@/components/dashboard-client";

export default async function DashboardPage() {
  const workspaces = await getWorkspaces();
  const deptCount = await prisma.department.count();
  const needsSeed = deptCount === 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border/50">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
              <LayoutDashboard className="h-4 w-4 text-white" />
            </div>
            <span className="font-display text-lg font-bold">TaskManager</span>
          </div>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Inicio
          </Link>
        </div>
      </nav>

      <DashboardClient workspaces={workspaces} needsSeed={needsSeed} />
    </div>
  );
}
