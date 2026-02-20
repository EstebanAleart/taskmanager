import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TaskAssignee {
  id: string;
  name: string | null;
  initials: string;
}

export interface TaskTag {
  id: string;
  name: string;
  color: string;
}

export interface TaskPriority {
  id: string;
  name: string;
  label: string;
  color: string;
  dotColor: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  columnId: string;
  priorityId: string | null;
  priority: TaskPriority | null;
  dueDate: string | null;
  createdAt: string;
  assignee: TaskAssignee | null;
  tags: TaskTag[];
}

export interface Column {
  id: string;
  name: string;
  label: string;
  color: string;
  icon: string | null;
  order: number;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface TaskState {
  projectId: string | null;
  tasks: Task[];
  columns: Column[];
  status: "idle" | "loading" | "succeeded" | "failed";
  _rollback: Record<
    string,
    { tasks?: Task[]; columns?: Column[] }
  >;
}

const initialState: TaskState = {
  projectId: null,
  tasks: [],
  columns: [],
  status: "idle",
  _rollback: {},
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}

const jsonOptions = (method: string, body: unknown): RequestInit => ({
  method,
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
});

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loadTaskData = createAsyncThunk(
  "task/loadAll",
  async (projectId: string) => {
    const [tasks, columns] = await Promise.all([
      apiFetch<Task[]>(`/api/tasks?projectId=${projectId}`),
      apiFetch<Column[]>(`/api/projects/${projectId}/columns`),
    ]);
    return { projectId, tasks, columns };
  }
);

// ── Task CRUD ─────────────────────────────────────────────────────────────────

interface CreateTaskPayload {
  title: string;
  description?: string;
  columnId: string;
  priorityId?: string;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
}

export const createTask = createAsyncThunk(
  "task/create",
  async (data: CreateTaskPayload, { rejectWithValue }) => {
    try {
      return await apiFetch<Task>("/api/tasks", jsonOptions("POST", data));
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const updateTask = createAsyncThunk(
  "task/update",
  async (
    arg: { id: string; data: Partial<Omit<CreateTaskPayload, "projectId">> },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<Task>(
        `/api/tasks/${arg.id}`,
        jsonOptions("PATCH", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const moveTask = createAsyncThunk(
  "task/move",
  async (
    arg: { id: string; columnId: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<Task>(
        `/api/tasks/${arg.id}`,
        jsonOptions("PATCH", { columnId: arg.columnId })
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  "task/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/api/tasks/${id}`, { method: "DELETE" });
      return id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ── Column CRUD ───────────────────────────────────────────────────────────────

interface CreateColumnPayload {
  projectId: string;
  name: string;
  label: string;
  color: string;
  icon?: string;
}

export const createColumn = createAsyncThunk(
  "task/createColumn",
  async (data: CreateColumnPayload, { rejectWithValue }) => {
    try {
      const { projectId, ...body } = data;
      return await apiFetch<Column>(
        `/api/projects/${projectId}/columns`,
        jsonOptions("POST", body)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const renameColumn = createAsyncThunk(
  "task/renameColumn",
  async (arg: { id: string; label: string }, { rejectWithValue }) => {
    try {
      return await apiFetch<Column>(
        `/api/columns/${arg.id}`,
        jsonOptions("PATCH", { label: arg.label })
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteColumn = createAsyncThunk(
  "task/deleteColumn",
  async (
    arg: { id: string; moveTasksToColumnId: string },
    { rejectWithValue }
  ) => {
    try {
      await apiFetch(
        `/api/columns/${arg.id}?moveTo=${arg.moveTasksToColumnId}`,
        { method: "DELETE" }
      );
      return arg;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const taskSlice = createSlice({
  name: "task",
  initialState,
  reducers: {
    resetTask: () => initialState,
    /** Hydrate from server-side props to skip network round-trip on initial load */
    hydrateTaskData: (
      state,
      action: {
        payload: { projectId: string; tasks: Task[]; columns: Column[] };
      }
    ) => {
      state.projectId = action.payload.projectId;
      state.tasks = action.payload.tasks;
      state.columns = action.payload.columns;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    // ── Load all ─────────────────────────────────────────────────────────
    builder
      .addCase(loadTaskData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadTaskData.fulfilled, (state, action) => {
        state.projectId = action.payload.projectId;
        state.tasks = action.payload.tasks;
        state.columns = action.payload.columns;
        state.status = "succeeded";
      })
      .addCase(loadTaskData.rejected, (state) => {
        state.status = "failed";
      });

    // ── Create task — optimistic (minimal placeholder) ────────────────────
    builder
      .addCase(createTask.pending, (state, action) => {
        const { title, columnId } = action.meta.arg;
        state.tasks.push({
          id: `__temp__${action.meta.requestId}`,
          title,
          description: null,
          columnId,
          priorityId: action.meta.arg.priorityId ?? null,
          priority: null,
          dueDate: action.meta.arg.dueDate ?? null,
          createdAt: new Date().toISOString(),
          assignee: null,
          tags: [],
        });
      })
      .addCase(createTask.fulfilled, (state, action) => {
        const tempId = `__temp__${action.meta.requestId}`;
        const idx = state.tasks.findIndex((t) => t.id === tempId);
        if (idx !== -1) state.tasks[idx] = action.payload;
        else state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.tasks = state.tasks.filter(
          (t) => t.id !== `__temp__${action.meta.requestId}`
        );
      });

    // ── Update task — optimistic ──────────────────────────────────────────
    builder
      .addCase(updateTask.pending, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.meta.arg.id);
        if (task) {
          state._rollback[action.meta.requestId] = {
            tasks: state.tasks.map((t) => ({ ...t })),
          };
          Object.assign(task, action.meta.arg.data);
        }
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(
          (t) => t.id === action.payload.id
        );
        if (idx !== -1) state.tasks[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(updateTask.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.tasks) state.tasks = rb.tasks;
        delete state._rollback[action.meta.requestId];
      });

    // ── Move task (drag-drop) — optimistic ────────────────────────────────
    builder
      .addCase(moveTask.pending, (state, action) => {
        const task = state.tasks.find((t) => t.id === action.meta.arg.id);
        if (task) {
          state._rollback[action.meta.requestId] = {
            tasks: state.tasks.map((t) => ({ ...t })),
          };
          task.columnId = action.meta.arg.columnId;
        }
      })
      .addCase(moveTask.fulfilled, (state, action) => {
        const idx = state.tasks.findIndex(
          (t) => t.id === action.payload.id
        );
        if (idx !== -1) state.tasks[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(moveTask.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.tasks) state.tasks = rb.tasks;
        delete state._rollback[action.meta.requestId];
      });

    // ── Delete task — optimistic ──────────────────────────────────────────
    builder
      .addCase(deleteTask.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          tasks: state.tasks.map((t) => ({ ...t })),
        };
        state.tasks = state.tasks.filter((t) => t.id !== action.meta.arg);
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteTask.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.tasks) state.tasks = rb.tasks;
        delete state._rollback[action.meta.requestId];
      });

    // ── Create column ─────────────────────────────────────────────────────
    builder
      .addCase(createColumn.pending, (state, action) => {
        const { name, label, color, icon } = action.meta.arg;
        state.columns.push({
          id: `__temp__${action.meta.requestId}`,
          name,
          label,
          color,
          icon: icon ?? null,
          order: state.columns.length,
        });
      })
      .addCase(createColumn.fulfilled, (state, action) => {
        const tempId = `__temp__${action.meta.requestId}`;
        const idx = state.columns.findIndex((c) => c.id === tempId);
        if (idx !== -1) state.columns[idx] = action.payload;
        else state.columns.push(action.payload);
      })
      .addCase(createColumn.rejected, (state, action) => {
        state.columns = state.columns.filter(
          (c) => c.id !== `__temp__${action.meta.requestId}`
        );
      });

    // ── Rename column — optimistic ────────────────────────────────────────
    builder
      .addCase(renameColumn.pending, (state, action) => {
        const col = state.columns.find((c) => c.id === action.meta.arg.id);
        if (col) {
          state._rollback[action.meta.requestId] = {
            columns: state.columns.map((c) => ({ ...c })),
          };
          col.label = action.meta.arg.label;
        }
      })
      .addCase(renameColumn.fulfilled, (state, action) => {
        const idx = state.columns.findIndex(
          (c) => c.id === action.payload.id
        );
        if (idx !== -1) state.columns[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(renameColumn.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.columns) state.columns = rb.columns;
        delete state._rollback[action.meta.requestId];
      });

    // ── Delete column — optimistic ────────────────────────────────────────
    builder
      .addCase(deleteColumn.pending, (state, action) => {
        const { id, moveTasksToColumnId } = action.meta.arg;
        state._rollback[action.meta.requestId] = {
          tasks: state.tasks.map((t) => ({ ...t })),
          columns: state.columns.map((c) => ({ ...c })),
        };
        // Move tasks to the fallback column optimistically
        state.tasks = state.tasks.map((t) =>
          t.columnId === id ? { ...t, columnId: moveTasksToColumnId } : t
        );
        state.columns = state.columns.filter((c) => c.id !== id);
      })
      .addCase(deleteColumn.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteColumn.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.tasks) state.tasks = rb.tasks;
        if (rb?.columns) state.columns = rb.columns;
        delete state._rollback[action.meta.requestId];
      });
  },
});

export const { resetTask, hydrateTaskData } = taskSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectTasks = (s: RootState) => s.task.tasks;
export const selectColumns = (s: RootState) => s.task.columns;
export const selectTaskStatus = (s: RootState) => s.task.status;
export const selectTasksByColumn = (columnId: string) => (s: RootState) =>
  s.task.tasks.filter((t) => t.columnId === columnId);

export default taskSlice.reducer;
