"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  FolderKanban,
  BarChart3,
  ChevronDown,
  Plus,
  Search,
  ArrowLeft,
  Trash2,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
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

interface WorkspaceSidebarProps {
  workspaceId: string;
  workspaceName: string;
  members: MemberItem[];
  projects: ProjectItem[];
  departments: DepartmentItem[];
}

const NAV_ITEMS = [
  { id: "proyectos", label: "Proyectos", icon: FolderKanban },
  { id: "miembros", label: "Miembros", icon: Users },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
];

export function WorkspaceSidebar({
  workspaceId,
  workspaceName,
  members,
  projects,
  departments,
}: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(true);
  const [sectorsOpen, setSectorsOpen] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteWorkspace = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Espacio de trabajo eliminado");
        router.push("/dashboard");
      } else {
        toast.error("Error al eliminar el espacio de trabajo");
      }
    } catch {
      toast.error("Error al eliminar el espacio de trabajo");
    } finally {
      setDeleting(false);
    }
  };

  const projectMatch = pathname.match(/\/project\/([^/]+)/);
  const activeProjectId = projectMatch ? projectMatch[1] : null;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-5">
        <Link
          href="/dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary transition-colors hover:bg-sidebar-primary/80"
        >
          <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
        </Link>
        <div className="flex-1 truncate">
          <h1 className="truncate font-display text-base font-bold text-sidebar-accent-foreground">
            {workspaceName}
          </h1>
          <p className="text-xs text-sidebar-foreground">Workspace</p>
        </div>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <div className="relative">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-sidebar-foreground" />
          <Input
            placeholder="Buscar..."
            className="h-9 border-sidebar-border bg-sidebar-accent pl-9 text-sm text-sidebar-accent-foreground placeholder:text-sidebar-foreground focus-visible:ring-sidebar-ring"
          />
        </div>
      </div>

      {/* Main Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <div className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={`/workspace/${workspaceId}?section=${item.id}`}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {item.id === "miembros" && (
                  <Badge variant="secondary" className="ml-auto h-5 bg-sidebar-accent px-1.5 text-[10px] text-sidebar-foreground">
                    {members.length}
                  </Badge>
                )}
                {item.id === "proyectos" && (
                  <Badge variant="secondary" className="ml-auto h-5 bg-sidebar-accent px-1.5 text-[10px] text-sidebar-foreground">
                    {projects.length}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>

        {/* Projects list */}
        <div className="mt-6">
          <button
            onClick={() => setProjectsOpen(!projectsOpen)}
            className="flex w-full items-center justify-between px-3 py-1"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              Proyectos
            </p>
            <ChevronDown
              className={cn(
                "h-3 w-3 text-sidebar-foreground/60 transition-transform",
                !projectsOpen && "-rotate-90"
              )}
            />
          </button>
          {projectsOpen && (
            <div className="mt-2 space-y-1">
              {projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/workspace/${workspaceId}/project/${project.id}`}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeProjectId === project.id
                      ? "bg-sidebar-primary/15 text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className={cn("h-2 w-2 rounded-full", project.color)} />
                  <span className="truncate">{project.name}</span>
                  <span className="ml-auto text-xs text-sidebar-foreground/50">
                    {project._count.tasks}
                  </span>
                </Link>
              ))}
              <Link
                href={`/workspace/${workspaceId}?section=proyectos`}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Plus className="h-3 w-3" />
                Nuevo proyecto
              </Link>
            </div>
          )}
        </div>

        {/* Sectors (departments) */}
        {departments.length > 0 && (
          <div className="mt-6">
            <button
              onClick={() => setSectorsOpen(!sectorsOpen)}
              className="flex w-full items-center justify-between px-3 py-1"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
                Sectores
              </p>
              <ChevronDown
                className={cn(
                  "h-3 w-3 text-sidebar-foreground/60 transition-transform",
                  !sectorsOpen && "-rotate-90"
                )}
              />
            </button>
            {sectorsOpen && (
              <div className="mt-2 space-y-1">
                {departments.map((dept) => (
                  <Link
                    key={dept.id}
                    href={`/workspace/${workspaceId}?section=sector&dept=${dept.id}`}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  >
                    <span
                      className={cn(
                        "inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium",
                        dept.bgColor,
                        dept.color
                      )}
                    >
                      {dept.label}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Members list */}
        <div className="mt-6">
          <button
            onClick={() => setMembersOpen(!membersOpen)}
            className="flex w-full items-center justify-between px-3 py-1"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
              Miembros
            </p>
            <ChevronDown
              className={cn(
                "h-3 w-3 text-sidebar-foreground/60 transition-transform",
                !membersOpen && "-rotate-90"
              )}
            />
          </button>
          {membersOpen && (
            <div className="mt-2 space-y-1">
              {members.map((m) => (
                <div
                  key={m.userId}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-sidebar-primary text-[10px] text-sidebar-primary-foreground">
                      {m.user.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{m.user.name}</span>
                </div>
              ))}
              {members.length === 0 && (
                <p className="px-3 py-2 text-xs text-sidebar-foreground/50">
                  Sin miembros
                </p>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Bottom */}
      <div className="border-t border-sidebar-border p-3 space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al Dashboard
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
              Eliminar workspace
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Eliminar espacio de trabajo</AlertDialogTitle>
              <AlertDialogDescription>
                Esta accion es permanente. Se eliminaran todos los proyectos, tareas, miembros y datos asociados a este workspace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-transparent">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteWorkspace}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? "Eliminando..." : "Eliminar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </aside>
  );
}
