import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MemberDepartment {
  name: string;
  label: string;
  color: string;
  bgColor: string;
}

export interface WorkspaceMember {
  userId: string;
  role: string;
  user: {
    id: string;
    name: string;
    initials: string;
    role: string;
    department: MemberDepartment;
  };
}

export interface AvailableUser {
  id: string;
  name: string;
  initials: string;
  role: string;
  department: MemberDepartment;
}

// ─── State ────────────────────────────────────────────────────────────────────

interface WorkspaceState {
  workspaceId: string | null;
  members: WorkspaceMember[];
  availableUsers: AvailableUser[];
  status: "idle" | "loading" | "succeeded" | "failed";
  _rollback: Record<string, { members?: WorkspaceMember[] }>;
}

const initialState: WorkspaceState = {
  workspaceId: null,
  members: [],
  availableUsers: [],
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

export const loadWorkspaceData = createAsyncThunk(
  "workspace/loadAll",
  async (workspaceId: string) => {
    const [members, availableUsers] = await Promise.all([
      apiFetch<WorkspaceMember[]>(
        `/api/workspaces/${workspaceId}/members`
      ),
      apiFetch<AvailableUser[]>(
        `/api/workspaces/${workspaceId}/available-users`
      ),
    ]);
    return { workspaceId, members, availableUsers };
  }
);

export const addMember = createAsyncThunk(
  "workspace/addMember",
  async (
    arg: { workspaceId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<WorkspaceMember>(
        `/api/workspaces/${arg.workspaceId}/members`,
        jsonOptions("POST", { userId: arg.userId })
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const removeMember = createAsyncThunk(
  "workspace/removeMember",
  async (
    arg: { workspaceId: string; userId: string },
    { rejectWithValue }
  ) => {
    try {
      await apiFetch(
        `/api/workspaces/${arg.workspaceId}/members/${arg.userId}`,
        { method: "DELETE" }
      );
      return arg.userId;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteWorkspace = createAsyncThunk(
  "workspace/delete",
  async (workspaceId: string, { rejectWithValue }) => {
    try {
      await apiFetch(`/api/workspaces/${workspaceId}`, { method: "DELETE" });
      return workspaceId;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    resetWorkspace: () => initialState,
    /** Seed Redux from server-side props — no API call needed */
    hydrateWorkspaceData: (
      state,
      action: {
        payload: {
          workspaceId: string;
          members: WorkspaceMember[];
          availableUsers?: AvailableUser[];
        };
      }
    ) => {
      state.workspaceId = action.payload.workspaceId;
      state.members = action.payload.members;
      if (action.payload.availableUsers) {
        state.availableUsers = action.payload.availableUsers;
      }
      state.status = "succeeded";
    },
  },
  extraReducers: (builder) => {
    // ── Load all ─────────────────────────────────────────────────────────
    builder
      .addCase(loadWorkspaceData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadWorkspaceData.fulfilled, (state, action) => {
        state.workspaceId = action.payload.workspaceId;
        state.members = action.payload.members;
        state.availableUsers = action.payload.availableUsers;
        state.status = "succeeded";
      })
      .addCase(loadWorkspaceData.rejected, (state) => {
        state.status = "failed";
      });

    // ── Add member — optimistic ───────────────────────────────────────────
    builder
      .addCase(addMember.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          members: state.members.map((m) => ({ ...m })),
        };
        // Optimistically remove from available users
        state.availableUsers = state.availableUsers.filter(
          (u) => u.id !== action.meta.arg.userId
        );
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
        delete state._rollback[action.meta.requestId];
      })
      .addCase(addMember.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.members) state.members = rb.members;
        // Re-fetch available users on next load; for now just restore from rollback
        delete state._rollback[action.meta.requestId];
      });

    // ── Remove member — optimistic ────────────────────────────────────────
    builder
      .addCase(removeMember.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          members: state.members.map((m) => ({ ...m })),
        };
        state.members = state.members.filter(
          (m) => m.userId !== action.meta.arg.userId
        );
      })
      .addCase(removeMember.fulfilled, (state, action) => {
        // Add the removed user back to availableUsers
        const removed = state._rollback[action.meta.requestId]?.members?.find(
          (m) => m.userId === action.payload
        );
        if (removed) {
          state.availableUsers.push({
            id: removed.userId,
            name: removed.user.name,
            initials: removed.user.initials,
            role: removed.user.role,
            department: removed.user.department,
          });
        }
        delete state._rollback[action.meta.requestId];
      })
      .addCase(removeMember.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.members) state.members = rb.members;
        delete state._rollback[action.meta.requestId];
      });
  },
});

export const { resetWorkspace, hydrateWorkspaceData } = workspaceSlice.actions;

// ─── Selectors ────────────────────────────────────────────────────────────────

export const selectWorkspaceMembers = (s: RootState) => s.workspace.members;
export const selectAvailableUsers = (s: RootState) => s.workspace.availableUsers;
export const selectWorkspaceStatus = (s: RootState) => s.workspace.status;
export const selectWorkspaceId = (s: RootState) => s.workspace.workspaceId;

export default workspaceSlice.reducer;
