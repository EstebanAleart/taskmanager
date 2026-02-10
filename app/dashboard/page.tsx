import { redirect } from "next/navigation";
import { LayoutDashboard } from "lucide-react";
import { getWorkspaces, getDepartmentCount } from "@/lib/queries";
import { DashboardClient } from "@/components/dashboard-client";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const workspaces = await getWorkspaces();
  const deptCount = await getDepartmentCount();
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
          <div className="flex items-center gap-4">
            {session?.user && (
              <span className="text-sm text-muted-foreground">
                {session.user.name || session.user.email}
              </span>
            )}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Cerrar sesion
              </button>
            </form>
          </div>
        </div>
      </nav>

      <DashboardClient workspaces={workspaces} needsSeed={needsSeed} />
    </div>
  );
}
