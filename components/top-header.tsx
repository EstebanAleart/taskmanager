"use client";

import { useState, useRef, useEffect } from "react";
import {
  Filter,
  Plus,
  LayoutGrid,
  List,
  CalendarDays,
  Search,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type Task,
  type ViewMode,
  type FilterState,
  type Priority,
  DEPARTMENT_CONFIG,
  PRIORITY_CONFIG,
  TEAM_MEMBERS,
  type Department,
  getAllTags,
  EMPTY_FILTERS,
} from "@/lib/data";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  activeView: string;
  activeDepartment: Department | "todos";
  tasks: Task[];
  filteredCount: number;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onNewTask: () => void;
}

const VIEW_MODES: { id: ViewMode; icon: typeof LayoutGrid; label: string }[] = [
  { id: "kanban", icon: LayoutGrid, label: "Kanban" },
  { id: "lista", icon: List, label: "Lista" },
  { id: "calendario", icon: CalendarDays, label: "Calendario" },
];

export function TopHeader({
  activeView,
  activeDepartment,
  tasks,
  filteredCount,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onNewTask,
}: TopHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const allTags = getAllTags(tasks);

  const hasActiveFilters =
    filters.priorities.length > 0 ||
    filters.assignees.length > 0 ||
    filters.tags.length > 0;

  const activeFilterCount =
    filters.priorities.length + filters.assignees.length + filters.tags.length;

  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  if (activeView !== "tablero") return null;

  const togglePriority = (p: Priority) => {
    const next = filters.priorities.includes(p)
      ? filters.priorities.filter((x) => x !== p)
      : [...filters.priorities, p];
    onFiltersChange({ ...filters, priorities: next });
  };

  const toggleAssignee = (id: string) => {
    const next = filters.assignees.includes(id)
      ? filters.assignees.filter((x) => x !== id)
      : [...filters.assignees, id];
    onFiltersChange({ ...filters, assignees: next });
  };

  const toggleTag = (tag: string) => {
    const next = filters.tags.includes(tag)
      ? filters.tags.filter((x) => x !== tag)
      : [...filters.tags, tag];
    onFiltersChange({ ...filters, tags: next });
  };

  return (
    <div className="mb-6 flex flex-col gap-4">
      {/* Title row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {activeDepartment === "todos"
                ? "Todas las Tareas"
                : DEPARTMENT_CONFIG[activeDepartment].label}
            </h2>
            <Badge variant="secondary" className="text-xs">
              {filteredCount} tareas
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {tasks.filter((t) => t.columnId === "pendiente").length} pendientes,{" "}
            {tasks.filter((t) => t.columnId === "en_progreso").length} en
            progreso
          </p>
        </div>

        <Button
          size="sm"
          className="w-fit bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={onNewTask}
        >
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          Nueva Tarea
        </Button>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center rounded-lg bg-muted p-1">
          {VIEW_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onViewModeChange(mode.id)}
                title={mode.label}
                className={cn(
                  "rounded-md px-2.5 py-1.5 transition-colors",
                  isActive
                    ? "bg-card text-card-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative flex items-center">
          {searchOpen ? (
            <div className="flex items-center gap-1.5">
              <div className="relative">
                <Search className="absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={searchRef}
                  placeholder="Buscar tareas..."
                  value={filters.search}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, search: e.target.value })
                  }
                  className="h-8 w-56 bg-card pl-8 text-sm"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground"
                onClick={() => {
                  setSearchOpen(false);
                  onFiltersChange({ ...filters, search: "" });
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent text-muted-foreground"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="mr-1.5 h-3.5 w-3.5" />
              Buscar
            </Button>
          )}
        </div>

        {/* Filter Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "bg-transparent",
                hasActiveFilters
                  ? "border-primary/30 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filtrar
              {activeFilterCount > 0 && (
                <Badge className="ml-1.5 h-5 w-5 rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-80 p-0"
          >
            <div className="border-b border-border px-4 py-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Filtros</h4>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={() =>
                      onFiltersChange({
                        ...EMPTY_FILTERS,
                        search: filters.search,
                      })
                    }
                    className="text-xs text-primary hover:underline"
                  >
                    Limpiar todo
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto p-4">
              {/* Priority filter */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Prioridad
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(PRIORITY_CONFIG) as Priority[]).map((p) => {
                    const config = PRIORITY_CONFIG[p];
                    const isSelected = filters.priorities.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => togglePriority(p)}
                        className={cn(
                          "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors",
                          isSelected
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 rounded-full",
                            config.dotColor
                          )}
                        />
                        {config.label}
                        {isSelected && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Assignee filter */}
              <div className="mb-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Asignado
                </p>
                <div className="flex flex-col gap-1">
                  {TEAM_MEMBERS.map((m) => {
                    const isSelected = filters.assignees.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => toggleAssignee(m.id)}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-muted"
                        )}
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary">
                          {m.initials}
                        </span>
                        <span className="flex-1 text-left">{m.name}</span>
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags filter */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Etiquetas
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {allTags.map((tag) => {
                    const isSelected = filters.tags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "rounded-md border px-2 py-1 text-xs transition-colors",
                          isSelected
                            ? "border-primary/30 bg-primary/10 text-primary"
                            : "border-border bg-card text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active filter badges */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-1.5">
            {filters.priorities.map((p) => (
              <Badge
                key={p}
                variant="secondary"
                className="cursor-pointer gap-1 bg-primary/10 text-xs text-primary hover:bg-primary/20"
                onClick={() => togglePriority(p)}
              >
                {PRIORITY_CONFIG[p].label}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            {filters.assignees.map((id) => {
              const m = TEAM_MEMBERS.find((m) => m.id === id);
              if (!m) return null;
              return (
                <Badge
                  key={id}
                  variant="secondary"
                  className="cursor-pointer gap-1 bg-primary/10 text-xs text-primary hover:bg-primary/20"
                  onClick={() => toggleAssignee(id)}
                >
                  {m.name.split(" ")[0]}
                  <X className="h-3 w-3" />
                </Badge>
              );
            })}
            {filters.tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer gap-1 bg-primary/10 text-xs text-primary hover:bg-primary/20"
                onClick={() => toggleTag(tag)}
              >
                {tag}
                <X className="h-3 w-3" />
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
