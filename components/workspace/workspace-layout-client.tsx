"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { WorkspaceSidebar } from "@/components/workspace/workspace-sidebar";
import { cn } from "@/lib/utils";

interface MemberItem {
  userId: string;
  user: {
    id: string;
    name: string;
    initials: string;
    role: string;
  };
}

interface ProjectItem {
  id: string;
  name: string;
  color: string;
  _count: { tasks: number };
}

interface DepartmentItem {
  id: string;
  name: string;
  label: string;
  color: string;
  bgColor: string;
}

interface WorkspaceLayoutClientProps {
  workspaceId: string;
  workspaceName: string;
  members: MemberItem[];
  projects: ProjectItem[];
  departments: DepartmentItem[];
  children: React.ReactNode;
}

export function WorkspaceLayoutClient({
  workspaceId,
  workspaceName,
  members,
  projects,
  departments,
  children,
}: WorkspaceLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <WorkspaceSidebar
          workspaceId={workspaceId}
          workspaceName={workspaceName}
          members={members}
          projects={projects}
          departments={departments}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-bold text-foreground">
            {workspaceName}
          </h1>
          <div className="w-9" />
        </div>

        {children}
      </main>
    </div>
  );
}
