"use client";

import React from "react";
import { useState, useCallback } from "react";
import {
  Plus,
  Circle,
  Loader2,
  Eye,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  Calendar,
  ArrowRight,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ProjectCreateTaskDialog } from "@/components/project/project-create-task-dialog";
import { moveTask, deleteTask, addColumn, deleteColumn, renameColumn } from "@/lib/actions/task";
import { AddColumnDialog } from "@/components/add-column-dialog";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface TaskTag {
  id: string;
  name: string;
}

interface PriorityItem {
  id: string;
  name: string;
  label: string;
  color: string;
  dotColor: string;
}

interface TaskAssignee {
  id: string;
  name: string;
  initials: string;
  department: { name: string; label: string; color: string; bgColor: string };
}

interface ColumnItem {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string;
  order: number;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  columnId: string;
  priorityId: string;
  priority: PriorityItem;
  dueDate: string | null;
  createdAt: string;
  assignee: TaskAssignee;
  tags: TaskTag[];
}

interface UserOption {
  id: string;
  name: string;
  initials: string;
}

interface ProjectKanbanProps {
  tasks: TaskItem[];
  columns: ColumnItem[];
  priorities: PriorityItem[];
  users: UserOption[];
  projectId: string;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  circle: Circle,
  loader: Loader2,
  eye: Eye,
  check: CheckCircle2,
};

export function ProjectKanban({ tasks, columns, priorities, users, projectId }: ProjectKanbanProps) {
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createDefaultColumnId, setCreateDefaultColumnId] = useState<string | undefined>();
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const router = useRouter();

  const handleDragOver = useCallback((e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(columnId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent, columnId: string) => {
      e.preventDefault();
      const taskId = e.dataTransfer.getData("taskId");
      if (taskId) {
        await moveTask(taskId, columnId);
        router.refresh();
      }
      setDragOverColumn(null);
    },
    [router]
  );

  const handleMoveTask = useCallback(
    async (taskId: string, targetColumnId: string) => {
      await moveTask(taskId, targetColumnId);
      router.refresh();
    },
    [router]
  );

  const handleDeleteTask = useCallback(
    async (taskId: string) => {
      await deleteTask(taskId);
      router.refresh();
    },
    [router]
  );

  const handleAddTask = (columnId: string) => {
    setCreateDefaultColumnId(columnId);
    setCreateOpen(true);
  };

  const handleAddColumn = async (column: { id: string; label: string; color: string; icon: string }) => {
    const name = column.label.toLowerCase().replace(/\s+/g, "_");
    await addColumn(projectId, name, column.label, column.color, column.icon);
    router.refresh();
  };

  const handleDeleteColumn = async (columnId: string) => {
    const firstCol = columns.find((c) => c.id !== columnId);
    if (!firstCol) return;
    await deleteColumn(columnId, firstCol.id);
    router.refresh();
  };

  const startRenaming = (columnId: string, currentLabel: string) => {
    setEditingColumn(columnId);
    setEditLabel(currentLabel);
  };

  const finishRenaming = async (columnId: string) => {
    if (editLabel.trim()) {
      await renameColumn(columnId, editLabel.trim());
      router.refresh();
    }
    setEditingColumn(null);
    setEditLabel("");
  };

  // Default columns that shouldn't be deleted
  const defaultColumnNames = ["pendiente", "en_progreso", "revision", "completada"];

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.columnId === column.id);
          const Icon = ICON_MAP[column.icon] || Circle;
          const isDefaultColumn = defaultColumnNames.includes(column.name);

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
                    <h3 className="text-sm font-semibold text-foreground">{column.label}</h3>
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
                    onClick={() => handleAddTask(column.id)}
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
                            onClick={() => handleDeleteColumn(column.id)}
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
                {columnTasks.map((task) => {
                  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
                  const isOverdue = dueDate && dueDate < new Date() && column.name !== "completada";

                  return (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("taskId", task.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      className="group w-full cursor-grab rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md active:cursor-grabbing"
                    >
                      {/* Top: department badge + menu */}
                      <div className="mb-3 flex items-center justify-between">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs font-medium",
                            task.assignee.department.bgColor,
                            task.assignee.department.color
                          )}
                        >
                          {task.assignee.department.label}
                        </Badge>
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
                                      onClick={() => handleMoveTask(task.id, col.id)}
                                    >
                                      {col.label}
                                    </DropdownMenuItem>
                                  ))}
                              </DropdownMenuSubContent>
                            </DropdownMenuSub>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteTask(task.id)}
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
                              key={tag.id}
                              className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground"
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Priority */}
                      <div className="mb-3 flex items-center gap-2">
                        <span className={cn("h-1.5 w-1.5 rounded-full", task.priority.dotColor)} />
                        <span className={cn("text-xs font-medium", task.priority.color)}>
                          {task.priority.label}
                        </span>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-muted-foreground">
                          {dueDate && (
                            <span
                              className={cn(
                                "flex items-center gap-1 text-xs",
                                isOverdue ? "text-destructive" : "text-muted-foreground"
                              )}
                            >
                              <Calendar className="h-3.5 w-3.5" />
                              {dueDate.toLocaleDateString("es-AR", {
                                day: "2-digit",
                                month: "short",
                              })}
                            </span>
                          )}
                        </div>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                            {task.assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                  );
                })}

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
                      onClick={() => handleAddTask(column.id)}
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
            onClick={() => setAddColumnOpen(true)}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-12 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <Plus className="h-6 w-6" />
            <span className="text-sm font-medium">Nueva Columna</span>
          </button>
        </div>
      </div>

      <ProjectCreateTaskDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        projectId={projectId}
        columns={columns}
        priorities={priorities}
        users={users}
        defaultColumnId={createDefaultColumnId}
      />

      <AddColumnDialog
        open={addColumnOpen}
        onOpenChange={setAddColumnOpen}
        onAddColumn={handleAddColumn}
      />
    </>
  );
}
