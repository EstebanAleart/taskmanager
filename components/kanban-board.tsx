"use client";

import React from "react"

import { useState, useCallback } from "react";
import {
  Plus,
  Circle,
  Loader2,
  Eye,
  CheckCircle2,
  GripVertical,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { TaskCard } from "@/components/task-card";
import { type Task, type KanbanColumn, type Department } from "@/lib/data";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  tasks: Task[];
  columns: KanbanColumn[];
  activeDepartment: Department | "todos";
  onTaskSelect: (task: Task) => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onRenameColumn: (columnId: string, newLabel: string) => void;
  onAddTask: (columnId?: string) => void;
  onAddColumn: () => void;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  circle: Circle,
  loader: Loader2,
  eye: Eye,
  check: CheckCircle2,
};

export function KanbanBoard({
  tasks,
  columns,
  activeDepartment,
  onTaskSelect,
  onMoveTask,
  onDeleteTask,
  onDeleteColumn,
  onRenameColumn,
  onAddTask,
  onAddColumn,
}: KanbanBoardProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const filteredTasks =
    activeDepartment === "todos"
      ? tasks
      : tasks.filter((t) => t.department === activeDepartment);

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) {
        onMoveTask(taskId, columnId);
      }
      setDragOverColumn(null);
    },
    [onMoveTask]
  );

  const startRenaming = (columnId: string, currentLabel: string) => {
    setEditingColumn(columnId);
    setEditLabel(currentLabel);
  };

  const finishRenaming = (columnId: string) => {
    if (editLabel.trim()) {
      onRenameColumn(columnId, editLabel.trim());
    }
    setEditingColumn(null);
    setEditLabel("");
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
        const columnTasks = filteredTasks.filter((t) => t.columnId === column.id);
        const Icon = ICON_MAP[column.icon] || Circle;
        const isDefaultColumn = ["pendiente", "en_progreso", "revision", "completada"].includes(column.id);

        return (
          <div
            key={column.id}
            className={cn(
              "flex w-72 min-w-[288px] flex-col rounded-xl bg-muted/50 p-3 transition-colors",
              dragOverColumn === column.id && "bg-primary/5 ring-2 ring-primary/20 ring-inset"
            )}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-4 w-4", column.color)} />
                {editingColumn === column.id ? (
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={() => finishRenaming(column.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") finishRenaming(column.id);
                      if (e.key === "Escape") {
                        setEditingColumn(null);
                        setEditLabel("");
                      }
                    }}
                    className="h-6 w-28 rounded border border-primary bg-card px-1.5 text-sm font-semibold text-foreground outline-none"
                    autoFocus
                  />
                ) : (
                  <h3 className="text-sm font-semibold text-foreground">
                    {column.label}
                  </h3>
                )}
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex items-center gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => onAddTask(column.id)}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    >
                      <MoreHorizontal className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Columna
                    </DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => startRenaming(column.id, column.label)}>
                      <Pencil className="mr-2 h-3.5 w-3.5" />
                      Renombrar
                    </DropdownMenuItem>
                    {!isDefaultColumn && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDeleteColumn(column.id)}
                        >
                          <Trash2 className="mr-2 h-3.5 w-3.5" />
                          Eliminar columna
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex flex-1 flex-col gap-3">
              {columnTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  columns={columns}
                  onSelect={onTaskSelect}
                  onMoveTask={onMoveTask}
                  onDeleteTask={onDeleteTask}
                />
              ))}

              {columnTasks.length === 0 && (
                <div
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border border-dashed py-8 text-center transition-colors",
                    dragOverColumn === column.id
                      ? "border-primary/40 bg-primary/5"
                      : "border-border"
                  )}
                >
                  <p className="text-sm text-muted-foreground">Sin tareas</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs text-muted-foreground"
                    onClick={() => onAddTask(column.id)}
                  >
                    <Plus className="mr-1 h-3 w-3" />
                    Agregar tarea
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Add Column Button */}
      <div className="flex w-72 min-w-[288px] flex-col items-center justify-center">
        <button
          type="button"
          onClick={onAddColumn}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-12 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <Plus className="h-6 w-6" />
          <span className="text-sm font-medium">Nueva Columna</span>
        </button>
      </div>
    </div>
  );
}
