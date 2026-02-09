"use client";

import { useState, useCallback } from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { KanbanBoard } from "@/components/kanban-board";
import { TopHeader } from "@/components/top-header";
import { TaskDetail } from "@/components/task-detail";
import { ProjectsView } from "@/components/projects-view";
import { TeamView } from "@/components/team-view";
import { StatsView } from "@/components/stats-view";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { AddColumnDialog } from "@/components/add-column-dialog";
import {
  INITIAL_TASKS,
  DEFAULT_COLUMNS,
  EMPTY_FILTERS,
  type Task,
  type Department,
  type KanbanColumn,
} from "@/lib/data";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [activeView, setActiveView] = useState("tablero");
  const [activeDepartment, setActiveDepartment] = useState<Department | "todos">("todos");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);


  // Mutable state
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [columns, setColumns] = useState<KanbanColumn[]>(DEFAULT_COLUMNS);

  // Filters state
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Dialog state
  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [createTaskColumnId, setCreateTaskColumnId] = useState<string | undefined>();
  const [addColumnOpen, setAddColumnOpen] = useState(false);

  // Task operations
  const handleMoveTask = useCallback((taskId: string, targetColumnId: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, columnId: targetColumnId } : t))
    );
    // Update selected task if it's the one being moved
    setSelectedTask((prev) =>
      prev?.id === taskId ? { ...prev, columnId: targetColumnId } : prev
    );
  }, []);

  const handleDeleteTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setSelectedTask((prev) => (prev?.id === taskId ? null : prev));
  }, []);

  const handleCreateTask = useCallback((task: Task) => {
    setTasks((prev) => [task, ...prev]);
  }, []);

  const handleAddTask = useCallback((columnId?: string) => {
    setCreateTaskColumnId(columnId);
    setCreateTaskOpen(true);
  }, []);

  // Column operations
  const handleAddColumn = useCallback((column: KanbanColumn) => {
    setColumns((prev) => [...prev, column]);
  }, []);

  const handleDeleteColumn = useCallback(
    (columnId: string) => {
      // Move tasks from deleted column to first column
      const firstColumnId = columns[0]?.id || "pendiente";
      setTasks((prev) =>
        prev.map((t) =>
          t.columnId === columnId ? { ...t, columnId: firstColumnId } : t
        )
      );
      setColumns((prev) => prev.filter((c) => c.id !== columnId));
    },
    [columns]
  );

  const handleRenameColumn = useCallback((columnId: string, newLabel: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, label: newLabel } : c))
    );
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <AppSidebar
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
          activeDepartment={activeDepartment}
          onDepartmentChange={setActiveDepartment}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-base font-bold text-foreground">
            Tablero
          </h1>
          <div className="w-9" />
        </div>

        <div className="p-4 lg:p-6">
          {activeView === "tablero" && (
            <>
              <TopHeader
                activeView={activeView}
                activeDepartment={activeDepartment}
                tasks={tasks}
                onNewTask={() => handleAddTask()}
                filters={filters}
                onFiltersChange={setFilters}
                filteredCount={tasks.length}
                viewMode={"kanban"}
                onViewModeChange={() => {}}
              />
              <KanbanBoard
                tasks={tasks}
                columns={columns}
                activeDepartment={activeDepartment}
                onTaskSelect={setSelectedTask}
                onMoveTask={handleMoveTask}
                onDeleteTask={handleDeleteTask}
                onDeleteColumn={handleDeleteColumn}
                onRenameColumn={handleRenameColumn}
                onAddTask={handleAddTask}
                onAddColumn={() => setAddColumnOpen(true)}
              />
            </>
          )}

          {activeView === "proyectos" && <ProjectsView />}
          {activeView === "equipo" && <TeamView />}
          {activeView === "reportes" && <StatsView />}
        </div>
      </main>

      {/* Task Detail Panel */}
      {selectedTask && (
        <TaskDetail
          task={selectedTask}
          columns={columns}
          onClose={() => setSelectedTask(null)}
          onMoveTask={handleMoveTask}
        />
      )}

      {/* Create Task Dialog */}
      <CreateTaskDialog
        open={createTaskOpen}
        onOpenChange={setCreateTaskOpen}
        columns={columns}
        defaultColumnId={createTaskColumnId}
        onCreateTask={handleCreateTask}
      />

      {/* Add Column Dialog */}
      <AddColumnDialog
        open={addColumnOpen}
        onOpenChange={setAddColumnOpen}
        onAddColumn={handleAddColumn}
      />
    </div>
  );
}
