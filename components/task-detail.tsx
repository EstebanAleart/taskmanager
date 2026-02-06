"use client";

import React from "react"

import { useState, useRef } from "react";
import {
  X,
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  Tag,
  User,
  Flag,
  Send,
  ArrowRight,
  Upload,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Film,
  File,
  Download,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  type Task,
  type KanbanColumn,
  type FileAttachment,
  PRIORITY_CONFIG,
  DEPARTMENT_CONFIG,
  FILE_TYPE_CONFIG,
  TEAM_MEMBERS,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface TaskDetailProps {
  task: Task;
  columns: KanbanColumn[];
  onClose: () => void;
  onMoveTask: (taskId: string, targetColumnId: string) => void;
  onAddFile: (taskId: string, file: FileAttachment) => void;
  onRemoveFile: (taskId: string, fileId: string) => void;
}

const FILE_ICONS: Record<FileAttachment["type"], typeof ImageIcon> = {
  pdf: FileText,
  image: ImageIcon,
  doc: FileText,
  spreadsheet: FileSpreadsheet,
  video: Film,
  other: File,
};

function getFileType(fileName: string): FileAttachment["type"] {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
  if (["doc", "docx", "txt", "md"].includes(ext)) return "doc";
  if (["xls", "xlsx", "csv"].includes(ext)) return "spreadsheet";
  if (["mp4", "mov", "avi", "webm"].includes(ext)) return "video";
  return "other";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TaskDetail({
  task,
  columns,
  onClose,
  onMoveTask,
  onAddFile,
  onRemoveFile,
}: TaskDetailProps) {
  const priorityConfig = PRIORITY_CONFIG[task.priority];
  const deptConfig = DEPARTMENT_CONFIG[task.department];
  const currentColumn = columns.find((c) => c.id === task.columnId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    for (const file of Array.from(fileList)) {
      const newFile: FileAttachment = {
        id: `${task.id}-f-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: getFileType(file.name),
        size: formatBytes(file.size),
        uploadedAt: new Date().toISOString().split("T")[0],
        uploadedBy: TEAM_MEMBERS[0],
        taskId: task.id,
        taskTitle: task.title,
        url: "#",
      };
      onAddFile(task.id, newFile);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    handleFilesSelected(e.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 flex h-full w-full max-w-lg flex-col bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
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
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium",
                priorityConfig.bgColor,
                priorityConfig.color
              )}
            >
              <Flag className="mr-1 h-3 w-3" />
              {priorityConfig.label}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="font-display text-xl font-bold text-card-foreground">
            {task.title}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {task.description}
          </p>

          {/* Move actions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {columns
              .filter((col) => col.id !== task.columnId)
              .map((col) => (
                <Button
                  key={col.id}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 bg-transparent text-xs"
                  onClick={() => onMoveTask(task.id, col.id)}
                >
                  <ArrowRight className="h-3 w-3" />
                  {col.label}
                </Button>
              ))}
          </div>

          {/* Meta Grid */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Asignado a
              </div>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                    {task.assignee.initials}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-card-foreground">
                  {task.assignee.name}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                Estado
              </div>
              <span
                className={cn(
                  "text-sm font-medium",
                  currentColumn?.color || "text-muted-foreground"
                )}
              >
                {currentColumn?.label || "Sin columna"}
              </span>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Fecha limite
              </div>
              <span className="text-sm font-medium text-card-foreground">
                {new Date(task.dueDate).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="rounded-lg bg-muted/50 p-3">
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Creada
              </div>
              <span className="text-sm font-medium text-card-foreground">
                {new Date(task.createdAt).toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              Etiquetas
            </div>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="bg-muted text-muted-foreground"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <Separator className="my-5" />

          {/* Files Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" />
                Archivos ({task.files.length})
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 gap-1.5 bg-transparent text-xs"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3" />
                Subir
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </div>

            {/* Drop zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "mb-3 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
                isDraggingFile
                  ? "border-primary/50 bg-primary/5"
                  : "border-border"
              )}
            >
              <Upload
                className={cn(
                  "mx-auto mb-1.5 h-5 w-5",
                  isDraggingFile ? "text-primary" : "text-muted-foreground"
                )}
              />
              <p className="text-xs text-muted-foreground">
                {isDraggingFile
                  ? "Soltar archivos aqui"
                  : "Arrastra archivos o hace click en Subir"}
              </p>
            </div>

            {/* File list */}
            {task.files.length > 0 && (
              <div className="flex flex-col gap-2">
                {task.files.map((file) => {
                  const typeConfig = FILE_TYPE_CONFIG[file.type];
                  const Icon = FILE_ICONS[file.type];
                  return (
                    <div
                      key={file.id}
                      className="group flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/30"
                    >
                      <div
                        className={cn(
                          "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                          typeConfig.bgColor
                        )}
                      >
                        <Icon className={cn("h-4 w-4", typeConfig.color)} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-card-foreground">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {file.size} - {file.uploadedBy.name.split(" ")[0]} -{" "}
                          {new Date(file.uploadedAt).toLocaleDateString(
                            "es-AR",
                            { day: "2-digit", month: "short" }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Descargar"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Eliminar"
                          onClick={() => onRemoveFile(task.id, file.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="my-5" />

          {/* Comments Section */}
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />
              Comentarios ({task.comments})
            </div>

            {task.comments > 0 && (
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex gap-3">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                      {task.assignee.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 rounded-lg bg-muted/50 p-3">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-sm font-medium text-card-foreground">
                        {task.assignee.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        hace 2h
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Avance actualizado, falta revisar los tests de
                      integracion.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Escribir un comentario..."
              className="flex-1 bg-muted/50 text-sm"
            />
            <Button
              size="icon"
              className="h-9 w-9 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
