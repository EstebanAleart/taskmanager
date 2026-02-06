"use client";

import { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  List,
  FileText,
  ImageIcon,
  FileSpreadsheet,
  Film,
  File,
  Download,
  Paperclip,
  Calendar,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  type Task,
  type FileAttachment,
  FILE_TYPE_CONFIG,
  getAllFiles,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface FilesViewProps {
  tasks: Task[];
}

type FileTypeFilter = FileAttachment["type"] | "todos";

const FILE_ICONS: Record<FileAttachment["type"], typeof FileText> = {
  pdf: FileText,
  image: ImageIcon,
  doc: FileText,
  spreadsheet: FileSpreadsheet,
  video: Film,
  other: File,
};

const TYPE_FILTERS: { id: FileTypeFilter; label: string }[] = [
  { id: "todos", label: "Todos" },
  { id: "pdf", label: "PDF" },
  { id: "image", label: "Imagenes" },
  { id: "doc", label: "Documentos" },
  { id: "spreadsheet", label: "Planillas" },
  { id: "video", label: "Videos" },
  { id: "other", label: "Otros" },
];

export function FilesView({ tasks }: FilesViewProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<FileTypeFilter>("todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const allFiles = useMemo(() => getAllFiles(tasks), [tasks]);

  const filteredFiles = useMemo(() => {
    let result = allFiles;
    if (typeFilter !== "todos") {
      result = result.filter((f) => f.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.taskTitle.toLowerCase().includes(q) ||
          f.uploadedBy.name.toLowerCase().includes(q)
      );
    }
    return result.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [allFiles, typeFilter, search]);

  // Stats
  const stats = useMemo(() => {
    const byType: Record<string, number> = {};
    for (const f of allFiles) {
      byType[f.type] = (byType[f.type] || 0) + 1;
    }
    return byType;
  }, [allFiles]);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">
          Archivos y Documentos
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {allFiles.length} archivos compartidos en el equipo
        </p>
      </div>

      {/* Stats cards */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {TYPE_FILTERS.filter((t) => t.id !== "todos").map((t) => {
          const count = stats[t.id] || 0;
          const config =
            t.id !== "todos" ? FILE_TYPE_CONFIG[t.id as FileAttachment["type"]] : null;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() =>
                setTypeFilter(typeFilter === t.id ? "todos" : (t.id as FileTypeFilter))
              }
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border p-4 transition-colors",
                typeFilter === t.id
                  ? "border-primary/30 bg-primary/5"
                  : "border-border bg-card hover:bg-muted/50"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  config?.bgColor || "bg-muted"
                )}
              >
                {(() => {
                  const Icon = FILE_ICONS[t.id as FileAttachment["type"]] || File;
                  return (
                    <Icon
                      className={cn(
                        "h-4 w-4",
                        config?.color || "text-muted-foreground"
                      )}
                    />
                  );
                })()}
              </span>
              <span className="text-lg font-bold text-foreground">{count}</span>
              <span className="text-xs text-muted-foreground">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {/* View toggle */}
        <div className="flex items-center rounded-lg bg-muted p-1">
          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={cn(
              "rounded-md px-2.5 py-1.5 transition-colors",
              viewMode === "grid"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode("list")}
            className={cn(
              "rounded-md px-2.5 py-1.5 transition-colors",
              viewMode === "list"
                ? "bg-card text-card-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar archivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 bg-card pl-8 text-sm"
          />
        </div>

        {/* Type filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeFilter(t.id)}
              className={cn(
                "rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                typeFilter === t.id
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-muted"
              )}
            >
              {t.label}
              {t.id !== "todos" && (
                <span className="ml-1 text-muted-foreground">
                  {stats[t.id] || 0}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* File count */}
      <p className="mb-3 text-xs text-muted-foreground">
        Mostrando {filteredFiles.length} de {allFiles.length} archivos
      </p>

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredFiles.map((file) => {
            const typeConfig = FILE_TYPE_CONFIG[file.type];
            const Icon = FILE_ICONS[file.type];
            return (
              <div
                key={file.id}
                className="group flex flex-col rounded-xl border border-border bg-card transition-all hover:border-primary/20 hover:shadow-md"
              >
                {/* File preview area */}
                <div
                  className={cn(
                    "flex h-28 items-center justify-center rounded-t-xl",
                    typeConfig.bgColor
                  )}
                >
                  <Icon className={cn("h-10 w-10", typeConfig.color)} />
                </div>
                {/* Info */}
                <div className="flex flex-1 flex-col p-3.5">
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-2 text-sm font-medium text-card-foreground">
                      {file.name}
                    </h4>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "shrink-0 text-[10px]",
                        typeConfig.bgColor,
                        typeConfig.color
                      )}
                    >
                      {typeConfig.extension}
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs text-muted-foreground">
                    {file.size}
                  </p>

                  {/* Task link */}
                  <div className="mb-2 flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1.5">
                    <Paperclip className="h-3 w-3 shrink-0 text-muted-foreground" />
                    <span className="truncate text-xs text-muted-foreground">
                      {file.taskTitle}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-[9px] font-semibold text-primary">
                        {file.uploadedBy.initials}
                      </span>
                      <span>{file.uploadedBy.name.split(" ")[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(file.uploadedAt).toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </div>
                  </div>
                </div>

                {/* Hover actions */}
                <div className="flex items-center justify-end gap-1 border-t border-border px-3 py-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Download className="h-3 w-3" />
                    Descargar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="rounded-xl border border-border bg-card">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 border-b border-border px-4 py-2.5 text-xs font-medium text-muted-foreground">
            <div className="col-span-5">Archivo</div>
            <div className="col-span-2">Tipo</div>
            <div className="col-span-2 hidden sm:block">Tarea</div>
            <div className="col-span-1 hidden lg:block">Subido por</div>
            <div className="col-span-1">Fecha</div>
            <div className="col-span-1 text-right">Tamano</div>
          </div>

          {filteredFiles.map((file, idx) => {
            const typeConfig = FILE_TYPE_CONFIG[file.type];
            const Icon = FILE_ICONS[file.type];
            return (
              <div
                key={file.id}
                className={cn(
                  "group grid grid-cols-12 items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
                  idx < filteredFiles.length - 1 && "border-b border-border"
                )}
              >
                {/* Name */}
                <div className="col-span-5 flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                      typeConfig.bgColor
                    )}
                  >
                    <Icon className={cn("h-4 w-4", typeConfig.color)} />
                  </div>
                  <span className="truncate text-sm font-medium text-card-foreground">
                    {file.name}
                  </span>
                </div>

                {/* Type */}
                <div className="col-span-2">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px]",
                      typeConfig.bgColor,
                      typeConfig.color
                    )}
                  >
                    {typeConfig.label}
                  </Badge>
                </div>

                {/* Task */}
                <div className="col-span-2 hidden truncate text-xs text-muted-foreground sm:block">
                  {file.taskTitle}
                </div>

                {/* Uploaded by */}
                <div className="col-span-1 hidden lg:block">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                    {file.uploadedBy.initials}
                  </span>
                </div>

                {/* Date */}
                <div className="col-span-1 text-xs text-muted-foreground">
                  {new Date(file.uploadedAt).toLocaleDateString("es-AR", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>

                {/* Size */}
                <div className="col-span-1 text-right text-xs text-muted-foreground">
                  {file.size}
                </div>
              </div>
            );
          })}

          {filteredFiles.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Filter className="mb-2 h-8 w-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No se encontraron archivos
              </p>
              <p className="text-xs text-muted-foreground/70">
                Proba cambiando los filtros o la busqueda
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state for grid */}
      {viewMode === "grid" && filteredFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <Filter className="mb-2 h-8 w-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">
            No se encontraron archivos
          </p>
          <p className="text-xs text-muted-foreground/70">
            Proba cambiando los filtros o la busqueda
          </p>
        </div>
      )}
    </div>
  );
}
