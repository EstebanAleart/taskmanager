"use client";

import { Plus, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PROJECTS, DEPARTMENT_CONFIG } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ProjectsView() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-foreground">
            Proyectos
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {PROJECTS.length} proyectos activos
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Proyecto
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {PROJECTS.map((project) => {
          const deptConfig = DEPARTMENT_CONFIG[project.department];
          return (
            <div
              key={project.id}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      project.color + "/15"
                    )}
                  >
                    <div
                      className={cn(
                        "h-3 w-3 rounded-sm",
                        project.color
                      )}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">
                      {project.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "mt-1 text-xs",
                        deptConfig.bgColor,
                        deptConfig.color
                      )}
                    >
                      {deptConfig.label}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground opacity-0 group-hover:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>

              <p className="mb-4 text-sm text-muted-foreground">
                {project.description}
              </p>

              {/* Progress */}
              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-medium text-card-foreground">
                    {project.progress}%
                  </span>
                </div>
                <Progress
                  value={project.progress}
                  className="h-1.5 bg-muted"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex -space-x-2">
                  {project.members.map((member) => (
                    <Avatar
                      key={member.id}
                      className="h-7 w-7 border-2 border-card"
                    >
                      <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <span>
                    {project.tasksDone}/{project.tasksTotal} tareas
                  </span>
                  <ArrowUpRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          );
        })}

        {/* Add Project Card */}
        <div className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border p-5 transition-all hover:border-primary/30 hover:bg-muted/30">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
            <Plus className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Crear proyecto
          </p>
        </div>
      </div>
    </div>
  );
}
