import { redirect } from "next/navigation";
import { getWorkspaces, getDepartmentCount } from "@/lib/queries";
import { DashboardClient } from "@/components/dashboard-client";
import { DashboardNavbar } from "@/components/dashboard-navbar";
import { auth, signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user?.status !== "active") redirect("/no-access");
  
  const workspaces = await getWorkspaces(session.user.id);
  const deptCount = await getDepartmentCount();
  const needsSeed = deptCount === 0;

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardNavbar session={session} onSignOut={handleSignOut} />
      <DashboardClient workspaces={workspaces} needsSeed={needsSeed} />
    </div>
  );
}