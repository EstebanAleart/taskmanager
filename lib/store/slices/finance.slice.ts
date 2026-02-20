import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface FinancialAccount {
  id: string;
  name: string;
  description: string;
  currency: string;
  balance: number;
}

export interface TransactionCategory {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

export interface FinancialTransaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  account: { id: string; name: string; currency: string };
  category: { id: string; name: string; type: string; color: string };
  project: { id: string; name: string; color: string } | null;
  createdBy: { id: string; name: string; initials: string };
}

export interface FinancialBudget {
  id: string;
  name: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
}

// ─── State shape ─────────────────────────────────────────────────────────────

interface FinanceState {
  workspaceId: string | null;
  accounts: FinancialAccount[];
  categories: TransactionCategory[];
  transactions: FinancialTransaction[];
  budgets: FinancialBudget[];
  status: "idle" | "loading" | "succeeded" | "failed";
  /** Rollback snapshots keyed by RTK requestId — used to revert optimistic updates */
  _rollback: Record<
    string,
    {
      accounts?: FinancialAccount[];
      categories?: TransactionCategory[];
      transactions?: FinancialTransaction[];
      budgets?: FinancialBudget[];
    }
  >;
}

const initialState: FinanceState = {
  workspaceId: null,
  accounts: [],
  categories: [],
  transactions: [],
  budgets: [],
  status: "idle",
  _rollback: {},
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const apiBase = (workspaceId: string) =>
  `/api/workspaces/${workspaceId}`;

async function apiFetch<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
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

// ─── Thunks: load all ────────────────────────────────────────────────────────

export const loadFinanceData = createAsyncThunk(
  "finance/loadAll",
  async (workspaceId: string) => {
    const [accounts, categories, transactions, budgets] = await Promise.all([
      apiFetch<FinancialAccount[]>(`${apiBase(workspaceId)}/accounts`),
      apiFetch<TransactionCategory[]>(`${apiBase(workspaceId)}/categories`),
      apiFetch<FinancialTransaction[]>(`${apiBase(workspaceId)}/transactions`),
      apiFetch<FinancialBudget[]>(`${apiBase(workspaceId)}/budgets`),
    ]);
    return { workspaceId, accounts, categories, transactions, budgets };
  }
);

// ─── Thunks: Accounts ────────────────────────────────────────────────────────

interface AccountPayload {
  name: string;
  description: string;
  currency: string;
  balance: number;
}

export const createAccount = createAsyncThunk(
  "finance/createAccount",
  async (
    arg: { workspaceId: string; data: AccountPayload },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<FinancialAccount>(
        `${apiBase(arg.workspaceId)}/accounts`,
        jsonOptions("POST", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const updateAccount = createAsyncThunk(
  "finance/updateAccount",
  async (
    arg: { workspaceId: string; id: string; data: Partial<AccountPayload> },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<FinancialAccount>(
        `${apiBase(arg.workspaceId)}/accounts/${arg.id}`,
        jsonOptions("PATCH", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteAccount = createAsyncThunk(
  "finance/deleteAccount",
  async (
    arg: { workspaceId: string; id: string },
    { rejectWithValue }
  ) => {
    try {
      await apiFetch(`${apiBase(arg.workspaceId)}/accounts/${arg.id}`, {
        method: "DELETE",
      });
      return arg.id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Thunks: Categories ──────────────────────────────────────────────────────

interface CategoryPayload {
  name: string;
  type: "income" | "expense";
  color: string;
}

export const createCategory = createAsyncThunk(
  "finance/createCategory",
  async (
    arg: { workspaceId: string; data: CategoryPayload },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<TransactionCategory>(
        `${apiBase(arg.workspaceId)}/categories`,
        jsonOptions("POST", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "finance/updateCategory",
  async (
    arg: { workspaceId: string; id: string; data: Partial<CategoryPayload> },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<TransactionCategory>(
        `${apiBase(arg.workspaceId)}/categories/${arg.id}`,
        jsonOptions("PATCH", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "finance/deleteCategory",
  async (
    arg: { workspaceId: string; id: string },
    { rejectWithValue }
  ) => {
    try {
      await apiFetch(`${apiBase(arg.workspaceId)}/categories/${arg.id}`, {
        method: "DELETE",
      });
      return arg.id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Thunks: Transactions ────────────────────────────────────────────────────

interface TransactionPayload {
  amount: number;
  description: string;
  date: string;
  accountId: string;
  categoryId: string;
}

export const createTransaction = createAsyncThunk(
  "finance/createTransaction",
  async (
    arg: { workspaceId: string; data: TransactionPayload },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<FinancialTransaction>(
        `${apiBase(arg.workspaceId)}/transactions`,
        jsonOptions("POST", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const updateTransaction = createAsyncThunk(
  "finance/updateTransaction",
  async (
    arg: {
      workspaceId: string;
      id: string;
      data: Partial<TransactionPayload>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<FinancialTransaction>(
        `${apiBase(arg.workspaceId)}/transactions/${arg.id}`,
        jsonOptions("PATCH", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  "finance/deleteTransaction",
  async (
    arg: { workspaceId: string; id: string },
    { rejectWithValue }
  ) => {
    try {
      await apiFetch(
        `${apiBase(arg.workspaceId)}/transactions/${arg.id}`,
        { method: "DELETE" }
      );
      return arg.id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Thunks: Budgets ─────────────────────────────────────────────────────────

interface BudgetPayload {
  name: string;
  amount: number;
  description: string;
}

export const createBudget = createAsyncThunk(
  "finance/createBudget",
  async (
    arg: { workspaceId: string; data: BudgetPayload },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<FinancialBudget>(
        `${apiBase(arg.workspaceId)}/budgets`,
        jsonOptions("POST", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const updateBudget = createAsyncThunk(
  "finance/updateBudget",
  async (
    arg: {
      workspaceId: string;
      id: string;
      data: Partial<BudgetPayload & { status: string }>;
    },
    { rejectWithValue }
  ) => {
    try {
      return await apiFetch<FinancialBudget>(
        `${apiBase(arg.workspaceId)}/budgets/${arg.id}`,
        jsonOptions("PATCH", arg.data)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

export const deleteBudget = createAsyncThunk(
  "finance/deleteBudget",
  async (
    arg: { workspaceId: string; id: string },
    { rejectWithValue }
  ) => {
    try {
      await apiFetch(`${apiBase(arg.workspaceId)}/budgets/${arg.id}`, {
        method: "DELETE",
      });
      return arg.id;
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Thunks: Transfers ───────────────────────────────────────────────────────

export const createTransfer = createAsyncThunk(
  "finance/createTransfer",
  async (
    arg: {
      workspaceId: string;
      fromAccountId: string;
      toAccountId: string;
      amount: number;
      rate: number;
      description: string;
      date: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const { workspaceId, ...body } = arg;
      return await apiFetch<{ from: FinancialTransaction; to: FinancialTransaction }>(
        `${apiBase(workspaceId)}/transfers`,
        jsonOptions("POST", body)
      );
    } catch (e) {
      return rejectWithValue((e as Error).message);
    }
  }
);

// ─── Slice ───────────────────────────────────────────────────────────────────

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    /** Reset state when switching workspaces */
    resetFinance: () => initialState,
  },
  extraReducers: (builder) => {
    // ── Load all ──────────────────────────────────────────────────────────
    builder
      .addCase(loadFinanceData.pending, (state) => {
        state.status = "loading";
      })
      .addCase(loadFinanceData.fulfilled, (state, action) => {
        const { workspaceId, accounts, categories, transactions, budgets } =
          action.payload;
        state.workspaceId = workspaceId;
        state.accounts = accounts;
        state.categories = categories;
        state.transactions = transactions;
        state.budgets = budgets;
        state.status = "succeeded";
      })
      .addCase(loadFinanceData.rejected, (state) => {
        state.status = "failed";
      });

    // ── Accounts ──────────────────────────────────────────────────────────
    builder
      // CREATE — optimistic: add temp item
      .addCase(createAccount.pending, (state, action) => {
        const { data } = action.meta.arg;
        const tempId = `__temp__${action.meta.requestId}`;
        state._rollback[action.meta.requestId] = {};
        state.accounts.unshift({
          id: tempId,
          name: data.name,
          description: data.description ?? "",
          currency: data.currency ?? "ARS",
          balance: data.balance ?? 0,
        });
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        const tempId = `__temp__${action.meta.requestId}`;
        const idx = state.accounts.findIndex((a) => a.id === tempId);
        if (idx !== -1) state.accounts[idx] = action.payload;
        else state.accounts.unshift(action.payload);
        delete state._rollback[action.meta.requestId];
      })
      .addCase(createAccount.rejected, (state, action) => {
        const tempId = `__temp__${action.meta.requestId}`;
        state.accounts = state.accounts.filter((a) => a.id !== tempId);
        delete state._rollback[action.meta.requestId];
      })

      // UPDATE — optimistic: patch in place
      .addCase(updateAccount.pending, (state, action) => {
        const { id, data } = action.meta.arg;
        const acc = state.accounts.find((a) => a.id === id);
        if (acc) {
          state._rollback[action.meta.requestId] = {
            accounts: state.accounts.map((a) => ({ ...a })),
          };
          Object.assign(acc, data);
        }
      })
      .addCase(updateAccount.fulfilled, (state, action) => {
        const idx = state.accounts.findIndex(
          (a) => a.id === action.payload.id
        );
        if (idx !== -1) state.accounts[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(updateAccount.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.accounts) state.accounts = rb.accounts;
        delete state._rollback[action.meta.requestId];
      })

      // DELETE — optimistic: remove immediately
      .addCase(deleteAccount.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          accounts: state.accounts.map((a) => ({ ...a })),
        };
        state.accounts = state.accounts.filter(
          (a) => a.id !== action.meta.arg.id
        );
      })
      .addCase(deleteAccount.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.accounts) state.accounts = rb.accounts;
        delete state._rollback[action.meta.requestId];
      });

    // ── Categories ────────────────────────────────────────────────────────
    builder
      .addCase(createCategory.pending, (state, action) => {
        const { data } = action.meta.arg;
        state.categories.unshift({
          id: `__temp__${action.meta.requestId}`,
          name: data.name,
          type: data.type,
          color: data.color ?? "",
        });
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        const tempId = `__temp__${action.meta.requestId}`;
        const idx = state.categories.findIndex((c) => c.id === tempId);
        if (idx !== -1) state.categories[idx] = action.payload;
        else state.categories.unshift(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.categories = state.categories.filter(
          (c) => c.id !== `__temp__${action.meta.requestId}`
        );
      })

      .addCase(updateCategory.pending, (state, action) => {
        const { id, data } = action.meta.arg;
        const cat = state.categories.find((c) => c.id === id);
        if (cat) {
          state._rollback[action.meta.requestId] = {
            categories: state.categories.map((c) => ({ ...c })),
          };
          Object.assign(cat, data);
        }
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        const idx = state.categories.findIndex(
          (c) => c.id === action.payload.id
        );
        if (idx !== -1) state.categories[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(updateCategory.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.categories) state.categories = rb.categories;
        delete state._rollback[action.meta.requestId];
      })

      .addCase(deleteCategory.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          categories: state.categories.map((c) => ({ ...c })),
        };
        state.categories = state.categories.filter(
          (c) => c.id !== action.meta.arg.id
        );
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.categories) state.categories = rb.categories;
        delete state._rollback[action.meta.requestId];
      });

    // ── Transactions ──────────────────────────────────────────────────────
    builder
      .addCase(createTransaction.pending, (state, action) => {
        // We can't build a full optimistic transaction without account/category objects
        // The server response is fast enough; we just add a placeholder
        state._rollback[action.meta.requestId] = {};
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.transactions.unshift(action.payload);
        delete state._rollback[action.meta.requestId];
      })
      .addCase(createTransaction.rejected, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })

      .addCase(updateTransaction.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          transactions: state.transactions.map((t) => ({ ...t })),
        };
        const { id, data } = action.meta.arg;
        const txn = state.transactions.find((t) => t.id === id);
        if (txn) Object.assign(txn, data);
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const idx = state.transactions.findIndex(
          (t) => t.id === action.payload.id
        );
        if (idx !== -1) state.transactions[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.transactions) state.transactions = rb.transactions;
        delete state._rollback[action.meta.requestId];
      })

      .addCase(deleteTransaction.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          transactions: state.transactions.map((t) => ({ ...t })),
        };
        state.transactions = state.transactions.filter(
          (t) => t.id !== action.meta.arg.id
        );
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.transactions) state.transactions = rb.transactions;
        delete state._rollback[action.meta.requestId];
      });

    // ── Budgets ───────────────────────────────────────────────────────────
    builder
      .addCase(createBudget.pending, (state, action) => {
        const { data } = action.meta.arg;
        state.budgets.unshift({
          id: `__temp__${action.meta.requestId}`,
          name: data.name,
          amount: data.amount,
          description: data.description ?? "",
          status: "pending",
        });
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        const tempId = `__temp__${action.meta.requestId}`;
        const idx = state.budgets.findIndex((b) => b.id === tempId);
        if (idx !== -1) state.budgets[idx] = action.payload;
        else state.budgets.unshift(action.payload);
      })
      .addCase(createBudget.rejected, (state, action) => {
        state.budgets = state.budgets.filter(
          (b) => b.id !== `__temp__${action.meta.requestId}`
        );
      })

      .addCase(updateBudget.pending, (state, action) => {
        const { id, data } = action.meta.arg;
        const bud = state.budgets.find((b) => b.id === id);
        if (bud) {
          state._rollback[action.meta.requestId] = {
            budgets: state.budgets.map((b) => ({ ...b })),
          };
          Object.assign(bud, data);
        }
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const idx = state.budgets.findIndex(
          (b) => b.id === action.payload.id
        );
        if (idx !== -1) state.budgets[idx] = action.payload;
        delete state._rollback[action.meta.requestId];
      })
      .addCase(updateBudget.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.budgets) state.budgets = rb.budgets;
        delete state._rollback[action.meta.requestId];
      })

      .addCase(deleteBudget.pending, (state, action) => {
        state._rollback[action.meta.requestId] = {
          budgets: state.budgets.map((b) => ({ ...b })),
        };
        state.budgets = state.budgets.filter(
          (b) => b.id !== action.meta.arg.id
        );
      })
      .addCase(deleteBudget.fulfilled, (state, action) => {
        delete state._rollback[action.meta.requestId];
      })
      .addCase(deleteBudget.rejected, (state, action) => {
        const rb = state._rollback[action.meta.requestId];
        if (rb?.budgets) state.budgets = rb.budgets;
        delete state._rollback[action.meta.requestId];
      });

    // ── Transfers — reload transactions after success ─────────────────────
    builder
      .addCase(createTransfer.fulfilled, (state, action) => {
        // Push both new transactions to the top of the list
        const { from, to } = action.payload;
        state.transactions.unshift(to, from);
      });
  },
});

export const { resetFinance } = financeSlice.actions;

// ─── Selectors ───────────────────────────────────────────────────────────────

export const selectAccounts = (s: RootState) => s.finance.accounts;
export const selectCategories = (s: RootState) => s.finance.categories;
export const selectTransactions = (s: RootState) => s.finance.transactions;
export const selectBudgets = (s: RootState) => s.finance.budgets;
export const selectFinanceStatus = (s: RootState) => s.finance.status;
export const selectFinanceWorkspaceId = (s: RootState) =>
  s.finance.workspaceId;

export default financeSlice.reducer;
