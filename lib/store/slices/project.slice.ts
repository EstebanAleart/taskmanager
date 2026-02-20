import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ProjectLink {
  id: string;
  title: string;
  url: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  color: string;
  icon: string | null;
  notes: string | null;
  links: ProjectLink[];
}

// ─── State ────────────────────────────────────────────────────────────────────

interface ProjectState {
  workspaceId: string | null;
  projects: Project[];
  status: "idle" | "loading" | "succeeded" | "failed";
  _rollback: Record<string, { projects?: Project[] }>;
}

const initialState: ProjectState = {
  workspaceId: null,
  projects: [],
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

export const loadProjects = createAsyncThunk(
  "project/loadAll",
  async (workspaceId: string) => {
    const projects = await apiFetch<Project[]>(
      `/api/projects?workspaceId=${workspaceId}`
    );
    return { workspaceId, projects };
  }
);

interface CreateProjectPayload {
  name: string;
  description?: string;
  color: string;
  icon?: string;
  workspaceId: string;
}

export const createProject = createAsyncThunk(
  "project/create",
  async (data: CreateProjectPayload, { rejectWithValue }) => {
    try {
      return await apiFetch<Project>("/api/projects", jsonOptions("POST", data));
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteProject = createAsyncThunk(
  "project/delete",
  async (id: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/api/projects/${id}`, { method: "DELETE" });
      return id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const updateProjectNotes = createAsyncThunk(
  "project/updateNotes",
  async (
    arg: { id: string; notes: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<Project>(
        `/api/projects/${arg.id}/notes`,
        jsonOptions("PATCH", { notes: arg.notes })
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const createProjectLink = createAsyncThunk(
  "project/createLink",
  async (
    arg: { projectId: string; title: string; url: string },
    { rejectWithValue }
  ) => {
    try {
      const link = await apiFetch<ProjectLink>(
        `/api/projects/${arg.projectId}/links`,
        jsonOptions("POST", { title: arg.title, url: arg.url })
      );
      return { projectId: arg.projectId, link };
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteProjectLink = createAsyncThunk(
  "project/deleteLink",
  async (
    arg: { projectId: string; linkId: string },
    { rejectWithValue }
  ) => {
    try {
      await apiFetch(
        `/api/projects/${arg.projectId}/links/${arg.linkId}`,
        { method: "DELETE" }
      );
      return arg;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    resetProject: () => initialState,
    /** Hydrate projects from server-side props (avoids extra network round-trip) */
    hydrateProjects: (
      state,
      action: { payload: { workspaceId: string; projects: Project[] } }
    ) => {
      state.workspaceId = action.payload.workspaceId;
      state.projects = action.payload.projects;
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    // ── Load all ─────────────────────────────────────────────────────────
    builder
      .addCase(loadProjects.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.workspaceId = action.payload.workspaceId;
        state.projects = action.payload.projects;
        state.status = "succeeded";
      })
      .addCase(loadProjects.rejected, (state) => {
        state.status = "failed";
      });

    // ── Create — optimistic ───────────────────────────────────────────────
    builder
      .addCase(createProject.pending, (state, action) => {
        const { name, description, color, icon } = action.meta.arg;
        state.projects.unshift({
          id: `__temp__${action.meta.requestId}`,
          name,
          description: description ?? null,
          color,
          icon: icon ?? null,
          notes: null,
          links: [],
        });
      })
      .addCase(createProject.fulfilled, (state, action) => {
        const tempId = `__temp__${action.meta.requestId}`;
        const idx = state.projects.findIndex((p) => p.id === tempId);
        if (idx !== -1) state.projects[idx] = action.payload;
        else state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.projects = state.projects.filter(
          (p) => p.id !== `__temp__${action.meta.requestId}`
        );
      });

    // ── Delete — optimistic ───────────────────────────────────────────────
    builder
      .addCase(deleteProject.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          projects: state.projects.map((p) => ({ ...p })),
        };
        state.projects = state.projects.filter(
          (p) => p.id !== action.meta.arg
        );
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteProject.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.projects) state.projects = rb.projects;
        delete state._rollback[action.meta.requestId];
      });

    // ── Update notes — optimistic ─────────────────────────────────────────
    builder
      .addCase(updateProjectNotes.pending, (state, action) => {
        const proj = state.projects.find((p) => p.id === action.meta.arg.id);
        if (proj) {
          state._rollback[action.meta.requestId] = {
            projects: state.projects.map((p) => ({ ...p })),
          };
          proj.notes = action.meta.arg.notes;
        }
      })
      .addCase(updateProjectNotes.fulfilled, (state, action) => {
        const idx = state.projects.findIndex(
          (p) => p.id === action.payload.id
        );
        if (idx !== -1) state.projects[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(updateProjectNotes.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.projects) state.projects = rb.projects;
        delete state._rollback[action.meta.requestId];
      });

    // ── Create link — optimistic ──────────────────────────────────────────
    builder
      .addCase(createProjectLink.pending, (state, action) => {
        const { projectId, title, url } = action.meta.arg;
        const proj = state.projects.find((p) => p.id === projectId);
        if (proj) {
          proj.links.push({
            id: `__temp__${action.meta.requestId}`,
            title,
            url,
          });
        }
      })
      .addCase(createProjectLink.fulfilled, (state, action) => {
        const { projectId, link } = action.payload;
        const proj = state.projects.find((p) => p.id === projectId);
        if (proj) {
          const tempIdx = proj.links.findIndex(
            (l) => l.id === `__temp__${action.meta.requestId}`
          );
          if (tempIdx !== -1) proj.links[tempIdx] = link;
          else proj.links.push(link);
        }
      })
      .addCase(createProjectLink.rejected, (state, action) => {
        const { projectId } = action.meta.arg;
        const proj = state.projects.find((p) => p.id === projectId);
        if (proj) {
          proj.links = proj.links.filter(
            (l) => l.id !== `__temp__${action.meta.requestId}`
          );
        }
      });

    // ── Delete link — optimistic ──────────────────────────────────────────
    builder
      .addCase(deleteProjectLink.pending, (state, action) => {
        const { projectId, linkId } = action.meta.arg;
        const proj = state.projects.find((p) => p.id === projectId);
        if (proj) {
          state._rollback[action.meta.requestId] = {
            projects: state.projects.map((p) => ({ ...p, links: [...p.links] })),
          };
          proj.links = proj.links.filter((l) => l.id !== linkId);
        }
      })
      .addCase(deleteProjectLink.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteProjectLink.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.projects) state.projects = rb.projects;
        delete state._rollback[action.meta.requestId];
      });
  },
});

export const { resetProject, hydrateProjects } = projectSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectProjects = (s: RootState) => s.project.projects;
export const selectProjectStatus = (s: RootState) => s.project.status;
export const selectProjectById = (id: string) => (s: RootState) =>
  s.project.projects.find((p) => p.id === id);

export default projectSlice.reducer;
