"use client";

import {
  MessageSquare,
  Paperclip,
  Calendar,
  MoreHorizontal,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  type Task,
  type KanbanColumn,
  PRIORITY_CONFIG,
  DEPARTMENT_CONFIG,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  columns: KanbanColumn[];
  onSelect: (task: Task) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  columns,
  onSelect,
  onMoveTask,
  onDeleteTask,
  isDragging,
}: TaskCardProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const deptConfig = DEPARTMENT_CONFIG[task.department];

  const isOverdue =
    new Date(task.dueDate) < new Date() && task.columnId !== "completada";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(task)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(task);
      }}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("taskId", task.id);
        e.dataTransfer.effectAllowed = "move";
      }}
      className={cn(
        "group w-full cursor-grab rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2 scale-105"
      )}
    >
      {/* Top row: dept + menu */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className={cn(
              "text-xs font-medium",
              deptConfig.bgColor,
              deptConfig.color
            )}
          >
            {deptConfig.label}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Acciones
            </DropdownMenuLabel>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                Mover a
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {columns
                  .filter((col) => col.id !== task.columnId)
                  .map((col) => (
                    <DropdownMenuItem
                      key={col.id}
                      onClick={() => onMoveTask(task.id, col.id)}
                    >
                      <span className={cn("mr-2 h-2 w-2 rounded-full", col.color.replace("text-", "bg-").replace("-400", "-500").replace("muted-foreground", "muted-foreground"))} />
                      {col.label}
                    </DropdownMenuItem>
                  ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => onDeleteTask(task.id)}
            >
              <Trash2 className="mr-2 h-3.5 w-3.5" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Title */}
      <h3 className="mb-2 text-sm font-semibold leading-snug text-card-foreground">
        {task.title}
      </h3>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Priority indicator */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className={cn("h-1.5 w-1.5 rounded-full", priorityConfig.dotColor)}
        />
        <span className={cn("text-xs font-medium", priorityConfig.color)}>
          {priorityConfig.label}
        </span>
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-muted-foreground">
          {task.comments > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <MessageSquare className="h-3.5 w-3.5" />
              {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <Paperclip className="h-3.5 w-3.5" />
              {task.attachments}
            </span>
          )}
          <span
            className={cn(
              "flex items-center gap-1 text-xs",
              isOverdue ? "text-destructive" : "text-muted-foreground"
            )}
          >
            <Calendar className="h-3.5 w-3.5" />
            {new Date(task.dueDate).toLocaleDateString("es-AR", {
              day: "2-digit",
              month: "short",
            })}
          </span>
        </div>
        <Avatar className="h-6 w-6">
          <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
            {task.assignee.initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
