"use client";

import { Mail, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS, DEPARTMENT_CONFIG, INITIAL_TASKS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function TeamView() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Equipo
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {TEAM_MEMBERS.length} miembros del equipo
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TEAM_MEMBERS.map((member) => {
          const deptConfig = DEPARTMENT_CONFIG[member.department];
          const memberTasks = INITIAL_TASKS.filter(
            (t) => t.assignee.id === member.id
          );
          const completedTasks = memberTasks.filter(
            (t) => t.status === "completada"
          );
          const inProgressTasks = memberTasks.filter(
            (t) => t.status === "en_progreso"
          );

          return (
            <div
              key={member.id}
              className="rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-primary/15 text-lg font-bold text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">
                      {member.name}
                    </h3>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-xs",
                        deptConfig.bgColor,
                        deptConfig.color
                      )}
                    >
                      {deptConfig.label}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{member.role}</p>

                  {/* Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-muted/50 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-card-foreground">
                        {memberTasks.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Total</p>
                    </div>
                    <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-blue-500">
                        {inProgressTasks.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Activas</p>
                    </div>
                    <div className="rounded-lg bg-emerald-500/10 px-3 py-2 text-center">
                      <p className="text-lg font-bold text-emerald-500">
                        {completedTasks.length}
                      </p>
                      <p className="text-xs text-muted-foreground">Listas</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs bg-transparent"
                    >
                      <Mail className="mr-1.5 h-3 w-3" />
                      Mensaje
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs bg-transparent"
                    >
                      <ExternalLink className="mr-1.5 h-3 w-3" />
                      Ver tareas
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
