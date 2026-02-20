"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  Plus,
  Pencil,
  Trash2,
  Wallet,
  Tag,
  PiggyBank,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  TrendingUp,
  ArrowLeftRight,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────
interface Account {
  id: string;
  name: string;
  description: string;
  currency: string;
  balance: number;
}

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
}

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  account: { id: string; name: string; currency: string };
  category: { id: string; name: string; type: string; color: string };
  project: { id: string; name: string; color: string } | null;
  createdBy: { id: string; name: string; initials: string };
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  description: string;
  status: "pending" | "approved" | "rejected";
}

// Categorías reservadas para transferencias del sistema (no editables por el usuario)
const SYSTEM_CATEGORY_NAMES = ["Transferencia (entrada)", "Transferencia (salida)"];

// ─── Tabs ────────────────────────────────────────────────
const FINANCE_TABS = [
  { id: "transacciones", label: "Transacciones", icon: DollarSign },
  { id: "cuentas", label: "Cuentas", icon: Wallet },
  { id: "categorias", label: "Categorías", icon: Tag },
  { id: "presupuestos", label: "Presupuestos", icon: PiggyBank },
];

const CATEGORY_COLORS = [
  { value: "text-emerald-500", label: "Verde" },
  { value: "text-blue-500", label: "Azul" },
  { value: "text-red-500", label: "Rojo" },
  { value: "text-orange-500", label: "Naranja" },
  { value: "text-yellow-500", label: "Amarillo" },
  { value: "text-purple-500", label: "Violeta" },
  { value: "text-pink-500", label: "Rosa" },
  { value: "text-cyan-500", label: "Cyan" },
];

const CURRENCIES = [
  { value: "ARS", label: "ARS — Peso argentino" },
  { value: "USD", label: "USD — Dólar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "BRL", label: "BRL — Real brasileño" },
  { value: "UYU", label: "UYU — Peso uruguayo" },
];

const BUDGET_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pendiente", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  approved: { label: "Aprobado", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  rejected: { label: "Rechazado", color: "text-red-500", bgColor: "bg-red-500/10" },
};

// ─── Component ──────────────────────────────────────────
interface WorkspaceFinanceProps {
  workspaceId: string;
}

export function WorkspaceFinance({ workspaceId }: WorkspaceFinanceProps) {
  const [activeTab, setActiveTab] = useState("transacciones");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog states
  const [accountDialog, setAccountDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [transactionDialog, setTransactionDialog] = useState(false);
  const [budgetDialog, setBudgetDialog] = useState(false);
  const [transferDialog, setTransferDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);

  // Month filter: null = all, string = "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  // Transaction filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAccountId, setFilterAccountId] = useState("");
  const [filterType, setFilterType] = useState<"" | "income" | "expense">("");
  const [filterCategoryId, setFilterCategoryId] = useState("");

  // Accounts: expanded breakdown per account id
  const [expandedBreakdown, setExpandedBreakdown] = useState<Set<string>>(new Set());

  function toggleBreakdown(id: string) {
    setExpandedBreakdown((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const base = `/api/workspaces/${workspaceId}`;

  // ─── Helper functions — defined BEFORE first use ────
  const getMonthKey = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const formatMonthLabel = (key: string) => {
    const [year, month] = key.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  };

  const formatMonthShort = (key: string) => {
    const [year, month] = key.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString("es-AR", { month: "short", year: "2-digit" });
  };

  const getMonthTotals = (txns: Transaction[]) => {
    const income = txns
      .filter((t) => t.category.type === "income")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    const expense = txns
      .filter((t) => t.category.type === "expense")
      .reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expense, balance: income - expense };
  };

  const getTotalsByCurrency = (txns: Transaction[]) => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const t of txns) {
      const cur = t.account.currency;
      if (!map[cur]) map[cur] = { income: 0, expense: 0 };
      if (t.category.type === "income") map[cur].income += Math.abs(t.amount);
      else map[cur].expense += Math.abs(t.amount);
    }
    return Object.entries(map).map(([currency, { income, expense }]) => ({
      currency,
      income,
      expense,
      balance: income - expense,
    }));
  };

  const formatCurrency = (amount: number, currency = "ARS") =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // Per-account monthly breakdown (computed client-side from existing transactions)
  const getAccountMonthlyBreakdown = (accountId: string) => {
    const accountTxns = transactions.filter((t) => t.account.id === accountId);
    const byMonth = accountTxns.reduce<Record<string, Transaction[]>>((acc, txn) => {
      const key = getMonthKey(txn.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    }, {});
    return Object.keys(byMonth)
      .sort((a, b) => b.localeCompare(a))
      .map((key) => ({
        key,
        label: formatMonthLabel(key),
        totals: getMonthTotals(byMonth[key]),
      }));
  };

  // ─── Data fetching ──────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [accRes, catRes, txnRes, budRes] = await Promise.all([
        fetch(`${base}/accounts`),
        fetch(`${base}/categories`),
        fetch(`${base}/transactions`),
        fetch(`${base}/budgets`),
      ]);
      const acc = accRes.ok ? await accRes.json() : [];
      const cat = catRes.ok ? await catRes.json() : [];
      const txn = txnRes.ok ? await txnRes.json() : [];
      const bud = budRes.ok ? await budRes.json() : [];
      setAccounts(Array.isArray(acc) ? acc : []);
      setCategories(Array.isArray(cat) ? cat : []);
      setTransactions(Array.isArray(txn) ? txn : []);
      setBudgets(Array.isArray(bud) ? bud : []);
    } catch {
      toast.error("Error al cargar datos financieros");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── CRUD helpers ───────────────────────────────────
  async function handleDelete(endpoint: string, label: string) {
    toast.warning(`Eliminar "${label}"?`, {
      description: "Esta acción es permanente.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            const res = await fetch(endpoint, { method: "DELETE" });
            if (res.ok) {
              toast.success("Eliminado correctamente");
              fetchAll();
            } else {
              toast.error("Error al eliminar");
            }
          } catch {
            toast.error("Error al eliminar");
          }
        },
      },
      cancel: { label: "Cancelar", onClick: () => {} },
    });
  }

  async function handleBudgetStatus(budget: Budget, status: "approved" | "rejected") {
    try {
      const res = await fetch(`${base}/budgets/${budget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success(status === "approved" ? "Presupuesto aprobado" : "Presupuesto rechazado");
        fetchAll();
      } else {
        toast.error("Error al actualizar estado");
      }
    } catch {
      toast.error("Error al actualizar estado");
    }
  }

  async function handleBudgetToTransaction(budget: Budget) {
    if (accounts.length === 0 || userCategories.length === 0) {
      toast.error("Necesitas al menos una cuenta y una categoría");
      return;
    }
    setEditingItem({
      amount: budget.amount,
      description: `Presupuesto: ${budget.name}`,
      date: new Date().toISOString(),
      account: { id: accounts[0].id },
      category: {
        id: userCategories.find((c) => c.type === "expense")?.id || userCategories[0].id,
      },
    } as unknown as Record<string, unknown>);
    setTransactionDialog(true);
  }

  // ─── Month navigation ───────────────────────────────
  const navigateMonth = (direction: number) => {
    const current = selectedMonth
      ? new Date(
          parseInt(selectedMonth.split("-")[0]),
          parseInt(selectedMonth.split("-")[1]) - 1
        )
      : new Date();
    current.setMonth(current.getMonth() + direction);
    setSelectedMonth(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
    );
  };

  // Categorías visibles para el usuario (excluye las de sistema)
  const userCategories = categories.filter(
    (c) => !SYSTEM_CATEGORY_NAMES.includes(c.name)
  );

  // ─── Derived data ───────────────────────────────────
  const transactionsByMonth = transactions.reduce<Record<string, Transaction[]>>(
    (acc, txn) => {
      const key = getMonthKey(txn.date);
      if (!acc[key]) acc[key] = [];
      acc[key].push(txn);
      return acc;
    },
    {}
  );

  const sortedMonths = Object.keys(transactionsByMonth).sort((a, b) =>
    b.localeCompare(a)
  );

  const filteredTransactions = transactions
    .filter((t) => !selectedMonth || getMonthKey(t.date) === selectedMonth)
    .filter((t) => !filterAccountId || t.account.id === filterAccountId)
    .filter((t) => !filterType || t.category.type === filterType)
    .filter((t) => !filterCategoryId || t.category.id === filterCategoryId)
    .filter((t) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.category.name.toLowerCase().includes(q) ||
        t.account.name.toLowerCase().includes(q)
      );
    });

  const filteredByMonth = selectedMonth
    ? { [selectedMonth]: filteredTransactions }
    : filteredTransactions.reduce<Record<string, Transaction[]>>((acc, txn) => {
        const key = getMonthKey(txn.date);
        if (!acc[key]) acc[key] = [];
        acc[key].push(txn);
        return acc;
      }, {});

  const filteredSortedMonths = Object.keys(filteredByMonth).sort((a, b) => b.localeCompare(a));

  const currencyTotals = getTotalsByCurrency(filteredTransactions);

  const hasActiveFilters = !!(searchQuery || filterAccountId || filterType || filterCategoryId);

  function clearFilters() {
    setSearchQuery("");
    setFilterAccountId("");
    setFilterType("");
    setFilterCategoryId("");
  }

  // ─── Account form ───────────────────────────────────
  function AccountForm() {
    const editing = editingItem as Account | null;
    const [name, setName] = useState(editing?.name || "");
    const [description, setDescription] = useState(editing?.description || "");
    const [currency, setCurrency] = useState(editing?.currency || "ARS");
    const [balance, setBalance] = useState(editing?.balance?.toString() || "0");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      if (!name.trim()) return;
      setSaving(true);
      try {
        const url = editing ? `${base}/accounts/${editing.id}` : `${base}/accounts`;
        const method = editing ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, description, currency, balance: parseFloat(balance) }),
        });
        if (res.ok) {
          toast.success(editing ? "Cuenta actualizada" : "Cuenta creada");
          setAccountDialog(false);
          setEditingItem(null);
          fetchAll();
        } else {
          toast.error("Error al guardar cuenta");
        }
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Banco principal"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Descripción</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Moneda</label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Balance inicial</label>
          <Input
            type="number"
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Saldo de partida antes de registrar transacciones. El balance real se calcula sumando todas las transacciones.
          </p>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? "Guardando..." : editing ? "Actualizar" : "Crear cuenta"}
        </Button>
      </div>
    );
  }

  // ─── Category form ──────────────────────────────────
  function CategoryForm() {
    const editing = editingItem as Category | null;
    const [name, setName] = useState(editing?.name || "");
    const [type, setType] = useState<"income" | "expense">(editing?.type || "expense");
    const [color, setColor] = useState(editing?.color || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      if (!name.trim()) return;
      setSaving(true);
      try {
        const url = editing
          ? `${base}/categories/${editing.id}`
          : `${base}/categories`;
        const method = editing ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, type, color }),
        });
        if (res.ok) {
          toast.success(editing ? "Categoría actualizada" : "Categoría creada");
          setCategoryDialog(false);
          setEditingItem(null);
          fetchAll();
        } else {
          toast.error("Error al guardar categoría");
        }
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Alquiler"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo</label>
          <Select value={type} onValueChange={(v) => setType(v as "income" | "expense")}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Ingreso</SelectItem>
              <SelectItem value="expense">Gasto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Color</label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_COLORS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className={c.value}>{c.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? "Guardando..." : editing ? "Actualizar" : "Crear categoría"}
        </Button>
      </div>
    );
  }

  // ─── Transaction form ───────────────────────────────
  function TransactionForm() {
    const editing = editingItem as (Transaction & { accountId?: string; categoryId?: string }) | null;
    const [amount, setAmount] = useState(editing?.amount?.toString() || "");
    const [description, setDescription] = useState(editing?.description || "");
    const [date, setDate] = useState(
      editing?.date
        ? new Date(editing.date).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10)
    );
    const [accountId, setAccountId] = useState(
      editing?.account?.id || editing?.accountId || ""
    );
    const [categoryId, setCategoryId] = useState(
      editing?.category?.id || editing?.categoryId || ""
    );
    const [saving, setSaving] = useState(false);

    const selectedAccount = accounts.find((a) => a.id === accountId);

    const handleSubmit = async () => {
      if (!amount || !accountId || !categoryId) return;
      setSaving(true);
      try {
        const url = editing?.id
          ? `${base}/transactions/${editing.id}`
          : `${base}/transactions`;
        const method = editing?.id ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseFloat(amount),
            description,
            date,
            accountId,
            categoryId,
          }),
        });
        if (res.ok) {
          toast.success(editing?.id ? "Transacción actualizada" : "Transacción creada");
          setTransactionDialog(false);
          setEditingItem(null);
          fetchAll();
        } else {
          toast.error("Error al guardar transacción");
        }
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Cuenta</label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name} ({a.currency})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">
            Monto{selectedAccount ? ` (${selectedAccount.currency})` : ""}
          </label>
          <div className="relative">
            {selectedAccount && (
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium">
                {selectedAccount.currency}
              </span>
            )}
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={selectedAccount ? "pl-12" : ""}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Descripción</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Categoría</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar categoría" />
            </SelectTrigger>
            <SelectContent>
              {userCategories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.type === "income" ? "↑" : "↓"} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? "Guardando..." : editing?.id ? "Actualizar" : "Crear transacción"}
        </Button>
      </div>
    );
  }

  // ─── Transfer form ──────────────────────────────────
  function TransferForm() {
    const [fromAccountId, setFromAccountId] = useState("");
    const [toAccountId, setToAccountId] = useState("");
    const [amount, setAmount] = useState("");
    const [rate, setRate] = useState("1");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);

    const fromAccount = accounts.find((a) => a.id === fromAccountId);
    const toAccount = accounts.find((a) => a.id === toAccountId);
    const parsedAmount = parseFloat(amount) || 0;
    const parsedRate = parseFloat(rate) || 1;
    const toAmount = Math.round(parsedAmount * parsedRate * 100) / 100;

    const handleSubmit = async () => {
      if (!fromAccountId || !toAccountId || !parsedAmount) return;
      setSaving(true);
      try {
        const res = await fetch(`${base}/transfers`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromAccountId,
            toAccountId,
            amount: parsedAmount,
            rate: parsedRate,
            description,
            date,
          }),
        });
        if (res.ok) {
          toast.success("Transferencia realizada");
          setTransferDialog(false);
          fetchAll();
        } else {
          const data = await res.json();
          toast.error(data.error || "Error al realizar transferencia");
        }
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Cuenta origen</label>
          <Select value={fromAccountId} onValueChange={setFromAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {accounts
                .filter((a) => a.id !== toAccountId)
                .map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency}) — {formatCurrency(a.balance, a.currency)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Cuenta destino</label>
          <Select value={toAccountId} onValueChange={setToAccountId}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar cuenta" />
            </SelectTrigger>
            <SelectContent>
              {accounts
                .filter((a) => a.id !== fromAccountId)
                .map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.currency}) — {formatCurrency(a.balance, a.currency)}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Monto{fromAccount ? ` (${fromAccount.currency})` : ""}
            </label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Tasa de cambio</label>
            <Input
              type="number"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="1"
              step="0.0001"
            />
          </div>
        </div>
        {fromAccount && toAccount && parsedAmount > 0 && (
          <div className="rounded-lg bg-muted/50 px-3 py-2 text-sm flex items-center gap-2">
            <ArrowLeftRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground">Recibirá:</span>
            <span className="font-semibold">
              {formatCurrency(toAmount, toAccount.currency)}
            </span>
            {fromAccount.currency !== toAccount.currency && (
              <span className="text-xs text-muted-foreground ml-auto">
                tasa: {rate}
              </span>
            )}
          </div>
        )}
        <div className="space-y-1">
          <label className="text-sm font-medium">Fecha</label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Descripción</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={saving || !fromAccountId || !toAccountId || !parsedAmount}
          className="w-full"
        >
          {saving ? "Transfiriendo..." : "Realizar transferencia"}
        </Button>
      </div>
    );
  }

  // ─── Budget form ────────────────────────────────────
  function BudgetForm() {
    const editing = editingItem as Budget | null;
    const [name, setName] = useState(editing?.name || "");
    const [amount, setAmount] = useState(editing?.amount?.toString() || "");
    const [description, setDescription] = useState(editing?.description || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      if (!name.trim() || !amount) return;
      setSaving(true);
      try {
        const url = editing ? `${base}/budgets/${editing.id}` : `${base}/budgets`;
        const method = editing ? "PATCH" : "POST";
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, amount: parseFloat(amount), description }),
        });
        if (res.ok) {
          toast.success(editing ? "Presupuesto actualizado" : "Presupuesto creado");
          setBudgetDialog(false);
          setEditingItem(null);
          fetchAll();
        } else {
          toast.error("Error al guardar presupuesto");
        }
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Nombre</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Marketing Q1"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Monto</label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Descripción</label>
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opcional"
          />
        </div>
        <Button onClick={handleSubmit} disabled={saving} className="w-full">
          {saving ? "Guardando..." : editing ? "Actualizar" : "Crear presupuesto"}
        </Button>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────
  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          Finanzas
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Gestiona cuentas, transacciones, categorías y presupuestos
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b pb-0">
        {FINANCE_TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          Cargando...
        </div>
      ) : (
        <>
          {/* ═══ TRANSACCIONES ═══ */}
          {activeTab === "transacciones" && (
            <div className="flex flex-col gap-4">
              {/* Month filter + new button */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      selectedMonth === null
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Todos
                  </button>
                  {selectedMonth && (
                    <span className="rounded-lg bg-primary/10 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-primary whitespace-nowrap">
                      <span className="sm:hidden">{formatMonthShort(selectedMonth)}</span>
                      <span className="hidden sm:inline">{formatMonthLabel(selectedMonth)}</span>
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setTransactionDialog(true);
                  }}
                  disabled={accounts.length === 0 || userCategories.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva transacción
                </Button>
              </div>

              {/* Search + filters */}
              <div className="flex flex-col gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Buscar por descripción, categoría o cuenta..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center flex-wrap">
                  {/* Type filter */}
                  <div className="flex rounded-lg border overflow-hidden shrink-0 self-start sm:self-auto">
                    {(
                      [
                        { v: "", label: "Todos" },
                        { v: "income", label: "Ingresos" },
                        { v: "expense", label: "Gastos" },
                      ] as const
                    ).map(({ v, label }) => (
                      <button
                        key={v}
                        onClick={() => setFilterType(v)}
                        className={cn(
                          "px-3 py-1.5 text-xs font-medium transition-colors",
                          filterType === v
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {/* Account + category selects — stack on mobile, inline on sm+ */}
                  <div className="flex flex-col sm:flex-row gap-2 flex-1 min-w-0">
                    {accounts.length > 1 && (
                      <Select
                        value={filterAccountId || "__all__"}
                        onValueChange={(v) => setFilterAccountId(v === "__all__" ? "" : v)}
                      >
                        <SelectTrigger className="h-8 text-xs w-full sm:w-auto sm:min-w-[130px]">
                          <SelectValue placeholder="Todas las cuentas" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todas las cuentas</SelectItem>
                          {accounts.map((a) => (
                            <SelectItem key={a.id} value={a.id}>
                              {a.name} ({a.currency})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {userCategories.length > 1 && (
                      <Select
                        value={filterCategoryId || "__all__"}
                        onValueChange={(v) => setFilterCategoryId(v === "__all__" ? "" : v)}
                      >
                        <SelectTrigger className="h-8 text-xs w-full sm:w-auto sm:min-w-[130px]">
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="__all__">Todas las categorías</SelectItem>
                          {userCategories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.type === "income" ? "↑" : "↓"} {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}

                    {hasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-muted-foreground gap-1 self-start"
                        onClick={clearFilters}
                      >
                        <X className="h-3 w-3" />
                        Limpiar filtros
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Multi-currency summary */}
              {filteredTransactions.length > 0 && (
                currencyTotals.length === 1 ? (
                  /* Single currency — 3 cards */
                  <div className="grid grid-cols-3 gap-2 sm:gap-3">
                    <div className="rounded-xl border bg-card p-2 sm:p-4 overflow-hidden">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-1">
                        <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span className="hidden sm:inline">Ingresos</span>
                        <span className="sm:hidden">↑</span>
                      </div>
                      <p className="text-xs sm:text-base font-semibold text-emerald-500 truncate">
                        +{formatCurrency(currencyTotals[0].income, currencyTotals[0].currency)}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-card p-2 sm:p-4 overflow-hidden">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-1">
                        <ArrowDownCircle className="h-3.5 w-3.5 text-red-500 shrink-0" />
                        <span className="hidden sm:inline">Gastos</span>
                        <span className="sm:hidden">↓</span>
                      </div>
                      <p className="text-xs sm:text-base font-semibold text-red-500 truncate">
                        -{formatCurrency(currencyTotals[0].expense, currencyTotals[0].currency)}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-card p-2 sm:p-4 overflow-hidden">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground mb-1">
                        <DollarSign className="h-3.5 w-3.5 shrink-0" />
                        <span className="hidden sm:inline">Balance</span>
                        <span className="sm:hidden">=</span>
                      </div>
                      <p
                        className={cn(
                          "text-xs sm:text-base font-semibold truncate",
                          currencyTotals[0].balance >= 0 ? "text-emerald-500" : "text-red-500"
                        )}
                      >
                        {formatCurrency(currencyTotals[0].balance, currencyTotals[0].currency)}
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Multiple currencies — table */
                  <div className="rounded-xl border bg-card overflow-hidden">
                    <div className="grid grid-cols-4 gap-px bg-border text-xs font-medium text-muted-foreground">
                      <div className="bg-card px-3 py-2">Moneda</div>
                      <div className="bg-card px-3 py-2 text-right text-emerald-500">Ingresos</div>
                      <div className="bg-card px-3 py-2 text-right text-red-500">Gastos</div>
                      <div className="bg-card px-3 py-2 text-right">Balance</div>
                    </div>
                    <div className="divide-y">
                      {currencyTotals.map(({ currency, income, expense, balance }) => (
                        <div key={currency} className="grid grid-cols-4 gap-px text-xs">
                          <div className="px-3 py-2.5 flex items-center">
                            <Badge variant="secondary" className="text-xs font-mono">
                              {currency}
                            </Badge>
                          </div>
                          <div className="px-3 py-2.5 text-right font-semibold text-emerald-500 truncate">
                            +{formatCurrency(income, currency)}
                          </div>
                          <div className="px-3 py-2.5 text-right font-semibold text-red-500 truncate">
                            -{formatCurrency(expense, currency)}
                          </div>
                          <div
                            className={cn(
                              "px-3 py-2.5 text-right font-semibold truncate",
                              balance >= 0 ? "text-emerald-500" : "text-red-500"
                            )}
                          >
                            {formatCurrency(balance, currency)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {accounts.length === 0 || userCategories.length === 0 ? (
                <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  Primero crea al menos una cuenta y una categoría para registrar transacciones.
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  {selectedMonth
                    ? "No hay transacciones en este mes."
                    : "No hay transacciones todavía."}
                </div>
              ) : (

                <div className="flex flex-col gap-4">
                  {filteredSortedMonths.map((monthKey) => {
                    const monthTxns = filteredByMonth[monthKey];
                    const monthCurrencyTotals = getTotalsByCurrency(monthTxns);
                    return (
                      <div key={monthKey} className="rounded-xl border bg-card overflow-hidden">
                        {/* Month header */}
                        <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-muted/30 flex-wrap">
                          <span className="text-sm font-semibold capitalize">
                            {formatMonthLabel(monthKey)}
                          </span>
                          <div className="flex flex-col items-end gap-0.5">
                            {monthCurrencyTotals.map(({ currency, income, expense, balance }) => (
                              <div key={currency} className="flex items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                                {monthCurrencyTotals.length > 1 && (
                                  <span className="font-mono text-[10px] bg-muted px-1 rounded">{currency}</span>
                                )}
                                <span className="text-emerald-500 whitespace-nowrap">
                                  +{formatCurrency(income, currency)}
                                </span>
                                <span className="text-red-500 whitespace-nowrap">
                                  -{formatCurrency(expense, currency)}
                                </span>
                                <span
                                  className={cn(
                                    "font-medium whitespace-nowrap",
                                    balance >= 0 ? "text-emerald-500" : "text-red-500"
                                  )}
                                >
                                  = {formatCurrency(balance, currency)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Month transactions */}
                        <div className="divide-y">
                          {monthTxns.map((txn) => (
                            <div
                              key={txn.id}
                              className="flex items-start gap-2.5 px-4 py-3 hover:bg-muted/20 transition-colors"
                            >
                              {/* Type icon */}
                              {txn.category.type === "income" ? (
                                <ArrowUpCircle className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                              ) : (
                                <ArrowDownCircle className="h-4 w-4 mt-0.5 text-red-500 shrink-0" />
                              )}

                              {/* Content — 2 lines */}
                              <div className="flex-1 min-w-0">
                                {/* Line 1: description + amount */}
                                <div className="flex items-baseline gap-2 justify-between">
                                  <p className="text-sm font-medium truncate leading-snug">
                                    {txn.description || txn.category.name}
                                  </p>
                                  <p
                                    className={cn(
                                      "text-sm font-bold shrink-0 tabular-nums",
                                      txn.category.type === "income"
                                        ? "text-emerald-500"
                                        : "text-red-500"
                                    )}
                                  >
                                    {txn.category.type === "income" ? "+" : "-"}
                                    {formatCurrency(Math.abs(txn.amount), txn.account.currency)}
                                  </p>
                                </div>

                                {/* Line 2: date · account · project + badge + actions */}
                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                  <span className="text-xs text-muted-foreground">
                                    {formatDate(txn.date)} · {txn.account.name}
                                    {txn.project && (
                                      <>
                                        {" · "}
                                        <span style={{ color: txn.project.color }}>
                                          {txn.project.name}
                                        </span>
                                      </>
                                    )}
                                  </span>
                                  <Badge
                                    variant="secondary"
                                    className={cn("text-xs shrink-0", txn.category.color)}
                                  >
                                    {txn.category.name}
                                  </Badge>
                                  <div className="flex items-center gap-0.5 ml-auto">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => {
                                        setEditingItem(txn);
                                        setTransactionDialog(true);
                                      }}
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() =>
                                        handleDelete(
                                          `${base}/transactions/${txn.id}`,
                                          txn.description || txn.category.name
                                        )
                                      }
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ CUENTAS ═══ */}
          {activeTab === "cuentas" && (
            <div className="flex flex-col gap-4">
              {/* Month filter + actions */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigateMonth(-1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      selectedMonth === null
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Todos
                  </button>
                  {selectedMonth && (
                    <span className="rounded-lg bg-primary/10 px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-primary whitespace-nowrap">
                      <span className="sm:hidden">{formatMonthShort(selectedMonth)}</span>
                      <span className="hidden sm:inline">{formatMonthLabel(selectedMonth)}</span>
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => navigateMonth(1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  {accounts.length >= 2 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setTransferDialog(true)}
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-1" />
                      Transferir
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={() => {
                      setEditingItem(null);
                      setAccountDialog(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Nueva cuenta
                  </Button>
                </div>
              </div>

              {accounts.length === 0 ? (
                <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  No hay cuentas todavía.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {accounts.map((acc) => {
                    const breakdown = getAccountMonthlyBreakdown(acc.id);

                    // Transactions for this account in the selected period
                    const periodTxns = transactions.filter(
                      (t) =>
                        t.account.id === acc.id &&
                        (!selectedMonth || getMonthKey(t.date) === selectedMonth)
                    );
                    const periodTotals = getMonthTotals(periodTxns);

                    // Breakdown rows to show (all months or just selected)
                    const breakdownRows = selectedMonth
                      ? breakdown.filter((b) => b.key === selectedMonth)
                      : breakdown;

                    // Balance dinámico según el período seleccionado:
                    // "Todos"  → balance acumulado total (desde API)
                    // Mes X    → balance al cierre de ese mes =
                    //             balance_total - impacto de transacciones POSTERIORES al mes X
                    const displayBalance = selectedMonth
                      ? (() => {
                          const afterImpact = transactions
                            .filter(
                              (t) =>
                                t.account.id === acc.id &&
                                getMonthKey(t.date) > selectedMonth
                            )
                            .reduce(
                              (sum, t) =>
                                t.category.type === "income"
                                  ? sum + t.amount
                                  : sum - t.amount,
                              0
                            );
                          return acc.balance - afterImpact;
                        })()
                      : acc.balance;

                    return (
                      <div key={acc.id} className="rounded-xl border bg-card overflow-hidden">
                        <div className="p-4 flex flex-col gap-3">
                          {/* Name + currency */}
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-semibold">{acc.name}</p>
                              {acc.description && (
                                <p className="text-xs text-muted-foreground">{acc.description}</p>
                              )}
                            </div>
                            <Badge variant="secondary">{acc.currency}</Badge>
                          </div>

                          {/* Balance dinámico */}
                          <div>
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {selectedMonth
                                ? `Balance al cierre — ${formatMonthLabel(selectedMonth)}`
                                : "Balance actual"}
                            </p>
                            <p
                              className={cn(
                                "text-base sm:text-xl font-bold truncate",
                                displayBalance < 0 && "text-red-500"
                              )}
                            >
                              {formatCurrency(displayBalance, acc.currency)}
                            </p>
                          </div>

                          {/* Period summary — siempre visible cuando hay mes seleccionado */}
                          {(selectedMonth || periodTxns.length > 0) && (
                            <div className="rounded-lg border bg-muted/20 overflow-hidden">
                              {selectedMonth && (
                                <p className="text-xs text-muted-foreground px-3 pt-2 pb-1 font-medium capitalize">
                                  {formatMonthLabel(selectedMonth)}
                                </p>
                              )}
                              <div className="grid grid-cols-3 gap-px bg-border">
                                <div className="text-center bg-card px-2 py-2 overflow-hidden">
                                  <p className="text-xs text-muted-foreground mb-0.5">Ingresos</p>
                                  <p className="text-xs sm:text-sm font-semibold text-emerald-500 truncate">
                                    +{formatCurrency(periodTotals.income, acc.currency)}
                                  </p>
                                </div>
                                <div className="text-center bg-card px-2 py-2 overflow-hidden">
                                  <p className="text-xs text-muted-foreground mb-0.5">Gastos</p>
                                  <p className="text-xs sm:text-sm font-semibold text-red-500 truncate">
                                    -{formatCurrency(periodTotals.expense, acc.currency)}
                                  </p>
                                </div>
                                <div className="text-center bg-card px-2 py-2 overflow-hidden">
                                  <p className="text-xs text-muted-foreground mb-0.5">Neto</p>
                                  <p
                                    className={cn(
                                      "text-xs sm:text-sm font-semibold truncate",
                                      periodTotals.balance >= 0 ? "text-emerald-500" : "text-red-500"
                                    )}
                                  >
                                    {periodTotals.balance >= 0 ? "+" : ""}
                                    {formatCurrency(periodTotals.balance, acc.currency)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Edit / Delete */}
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setEditingItem(acc);
                                setAccountDialog(true);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(`${base}/accounts/${acc.id}`, acc.name)}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-1" />
                              Eliminar
                            </Button>
                          </div>
                        </div>

                        {/* Monthly breakdown — collapsible */}
                        {breakdown.length > 0 && (
                          <div className="border-t">
                            <button
                              onClick={() => toggleBreakdown(acc.id)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/30 transition-colors"
                            >
                              <span className="uppercase tracking-wide">
                                {selectedMonth
                                  ? `Detalle — ${formatMonthLabel(selectedMonth)}`
                                  : "Movimientos por mes"}
                              </span>
                              <ChevronDown
                                className={cn(
                                  "h-3.5 w-3.5 transition-transform duration-200",
                                  expandedBreakdown.has(acc.id) && "rotate-180"
                                )}
                              />
                            </button>
                            {expandedBreakdown.has(acc.id) && breakdownRows.length === 0 && (
                              <p className="px-4 py-3 text-xs text-muted-foreground">
                                Sin movimientos en este mes.
                              </p>
                            )}
                            {expandedBreakdown.has(acc.id) && breakdownRows.length > 0 && (
                              <div className="divide-y">
                                {breakdownRows.map(({ key, label, totals }) => (
                                  <div
                                    key={key}
                                    className={cn(
                                      "flex items-center justify-between px-4 py-2 text-xs",
                                      selectedMonth === key && "bg-primary/5"
                                    )}
                                  >
                                    <span className="text-muted-foreground capitalize shrink-0 mr-2">
                                      {label}
                                    </span>
                                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                                      {totals.income > 0 && (
                                        <span className="text-emerald-500 whitespace-nowrap">
                                          +{formatCurrency(totals.income, acc.currency)}
                                        </span>
                                      )}
                                      {totals.expense > 0 && (
                                        <span className="text-red-500 whitespace-nowrap">
                                          -{formatCurrency(totals.expense, acc.currency)}
                                        </span>
                                      )}
                                      <span
                                        className={cn(
                                          "font-semibold whitespace-nowrap",
                                          totals.balance >= 0 ? "text-emerald-500" : "text-red-500"
                                        )}
                                      >
                                        = {formatCurrency(totals.balance, acc.currency)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ═══ CATEGORÍAS ═══ */}
          {activeTab === "categorias" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {userCategories.length} categoría{userCategories.length !== 1 ? "s" : ""}
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setCategoryDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nueva categoría
                </Button>
              </div>

              {userCategories.length === 0 ? (
                <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  No hay categorías todavía.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {/* Ingresos */}
                  {userCategories.filter((c) => c.type === "income").length > 0 && (
                    <div className="rounded-xl border bg-card overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-emerald-500/5">
                        <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                        <span className="text-sm font-semibold text-emerald-500">Ingresos</span>
                      </div>
                      <div className="divide-y">
                        {userCategories.filter((c) => c.type === "income").map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between px-4 py-2.5"
                          >
                            <span className={cn("text-sm font-medium", cat.color)}>
                              {cat.name}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingItem(cat);
                                  setCategoryDialog(true);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleDelete(`${base}/categories/${cat.id}`, cat.name)
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gastos */}
                  {userCategories.filter((c) => c.type === "expense").length > 0 && (
                    <div className="rounded-xl border bg-card overflow-hidden">
                      <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-red-500/5">
                        <ArrowDownCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm font-semibold text-red-500">Gastos</span>
                      </div>
                      <div className="divide-y">
                        {userCategories.filter((c) => c.type === "expense").map((cat) => (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between px-4 py-2.5"
                          >
                            <span className={cn("text-sm font-medium", cat.color)}>
                              {cat.name}
                            </span>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => {
                                  setEditingItem(cat);
                                  setCategoryDialog(true);
                                }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() =>
                                  handleDelete(`${base}/categories/${cat.id}`, cat.name)
                                }
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══ PRESUPUESTOS ═══ */}
          {activeTab === "presupuestos" && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <p className="text-sm text-muted-foreground">
                    {budgets.length} presupuesto{budgets.length !== 1 ? "s" : ""}
                  </p>
                  {budgets.length > 0 && (
                    <Badge variant="secondary">
                      Total: {formatCurrency(budgets.reduce((s, b) => s + b.amount, 0))}
                    </Badge>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingItem(null);
                    setBudgetDialog(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo presupuesto
                </Button>
              </div>

              {budgets.length === 0 ? (
                <div className="rounded-xl border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
                  No hay presupuestos todavía.
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {budgets.map((bud) => {
                    const st = BUDGET_STATUS[bud.status] || BUDGET_STATUS.pending;
                    return (
                      <div key={bud.id} className="rounded-xl border bg-card p-4 flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold">{bud.name}</p>
                          <span
                            className={cn(
                              "text-xs font-medium px-2 py-0.5 rounded-full shrink-0",
                              st.color,
                              st.bgColor
                            )}
                          >
                            {st.label}
                          </span>
                        </div>
                        {bud.description && (
                          <p className="text-xs text-muted-foreground">{bud.description}</p>
                        )}
                        <p className="text-base sm:text-xl font-bold truncate">{formatCurrency(bud.amount)}</p>
                        <div className="flex flex-wrap gap-2 mt-auto pt-1">
                          {bud.status === "pending" && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-emerald-500 hover:text-emerald-500 border-emerald-500/30"
                                onClick={() => handleBudgetStatus(bud, "approved")}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Aprobar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-500 border-red-500/30"
                                onClick={() => handleBudgetStatus(bud, "rejected")}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          {bud.status === "approved" &&
                            accounts.length > 0 &&
                            userCategories.length > 0 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleBudgetToTransaction(bud)}
                              >
                                <DollarSign className="h-3.5 w-3.5 mr-1" />
                                Crear transacción
                              </Button>
                            )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingItem(bud);
                              setBudgetDialog(true);
                            }}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDelete(`${base}/budgets/${bud.id}`, bud.name)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ═══ DIALOGS ═══ */}
      <Dialog
        open={accountDialog}
        onOpenChange={(open) => {
          setAccountDialog(open);
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar cuenta" : "Nueva cuenta"}</DialogTitle>
          </DialogHeader>
          <AccountForm />
        </DialogContent>
      </Dialog>

      <Dialog
        open={categoryDialog}
        onOpenChange={(open) => {
          setCategoryDialog(open);
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar categoría" : "Nueva categoría"}
            </DialogTitle>
          </DialogHeader>
          <CategoryForm />
        </DialogContent>
      </Dialog>

      <Dialog
        open={transactionDialog}
        onOpenChange={(open) => {
          setTransactionDialog(open);
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar transacción" : "Nueva transacción"}
            </DialogTitle>
          </DialogHeader>
          <TransactionForm />
        </DialogContent>
      </Dialog>

      <Dialog open={transferDialog} onOpenChange={setTransferDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir entre cuentas</DialogTitle>
          </DialogHeader>
          <TransferForm />
        </DialogContent>
      </Dialog>

      <Dialog
        open={budgetDialog}
        onOpenChange={(open) => {
          setBudgetDialog(open);
          if (!open) setEditingItem(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Editar presupuesto" : "Nuevo presupuesto"}
            </DialogTitle>
          </DialogHeader>
          <BudgetForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
