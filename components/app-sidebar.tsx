"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  BarChart3,
  Settings,
  Plus,
  ChevronDown,
  Search,
  Bell,
  Zap,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import MiPerfil from "@/components/MiPerfil";
import {
  PROJECTS,
  TEAM_MEMBERS,
  DEPARTMENT_CONFIG,
  type Department,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  activeDepartment: Department | "todos";
  onDepartmentChange: (dept: Department | "todos") => void;
}

const NAV_ITEMS = [
  { id: "tablero", label: "Tablero", icon: LayoutDashboard },
  { id: "proyectos", label: "Proyectos", icon: FolderKanban },
  { id: "equipo", label: "Equipo", icon: Users },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
];

export function AppSidebar({
  activeView,
  onViewChange,
  activeDepartment,
  onDepartmentChange,
}: AppSidebarProps) {
  const [projectsOpen, setProjectsOpen] = useState(true);
  const [perfilOpen, setPerfilOpen] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;

  // Fallback a datos mock si no hay sesión
  const displayUser = user || TEAM_MEMBERS[0];
  const userInitials = user?.initials || TEAM_MEMBERS[0].initials;
  const userName = user?.name || TEAM_MEMBERS[0].name;
  const userRole = user?.role || TEAM_MEMBERS[0].role;
  const userEmail = user?.email;
  const userImage = user?.image;

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      {/* ============= TU PERFIL ARRIBA ============= */}
      <div className="border-b border-sidebar-border p-4">
        <button
          onClick={() => setPerfilOpen(true)}
          className="flex w-full items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-sidebar-accent"
          title="Ver mi perfil"
        >
          <Avatar className="h-10 w-10 flex-shrink-0">
            {userImage && <AvatarImage src={userImage} />}
            <AvatarFallback className="bg-sidebar-primary text-sm text-sidebar-primary-foreground">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 truncate text-left">
            <p className="truncate text-sm font-semibold text-sidebar-accent-foreground">
              {userName}
            </p>
            <p className="truncate text-xs text-sidebar-foreground">
              {userEmail || userRole}
            </p>
          </div>
          <Settings className="h-4 w-4 text-sidebar-foreground/60 flex-shrink-0" />
        </button>
      </div>

      {/* Logo/Brand */}
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
          <Zap className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        <div>
          <h1 className="font-display text-base font-bold text-sidebar-accent-foreground">
            Tablero
          </h1>
          <p className="text-xs text-sidebar-foreground">Gestión de proyectos</p>
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
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-sidebar-primary/15 text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Department Filter */}
        <div className="mt-6">
          <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/60">
            Sectores
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onDepartmentChange("todos")}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                activeDepartment === "todos"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <span className="h-2 w-2 rounded-full bg-sidebar-foreground" />
              Todos
            </button>
            {(Object.keys(DEPARTMENT_CONFIG) as Department[]).map((dept) => {
              const config = DEPARTMENT_CONFIG[dept];
              return (
                <button
                  key={dept}
                  onClick={() => onDepartmentChange(dept)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    activeDepartment === dept
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span
                    className={cn("h-2 w-2 rounded-full", config.bgColor.replace("/15", ""))}
                  />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects */}
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
              {PROJECTS.map((project) => (
                <button
                  key={project.id}
                  onClick={() => onViewChange("tablero")}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <span className={cn("h-2 w-2 rounded-full", project.color)} />
                  <span className="truncate">{project.name}</span>
                  <span className="ml-auto text-xs text-sidebar-foreground/50">
                    {project.tasksDone}/{project.tasksTotal}
                  </span>
                </button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-2 px-3 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              >
                <Plus className="h-3 w-3" />
                Nuevo proyecto
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom - Notificaciones */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center justify-center gap-4">
          <button 
            className="relative text-sidebar-foreground hover:text-sidebar-accent-foreground"
            title="Notificaciones"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-sidebar" />
          </button>
        </div>
      </div>

      {/* Modal de Perfil */}
      <MiPerfil open={perfilOpen} onClose={() => setPerfilOpen(false)} />
    </aside>
  );
}