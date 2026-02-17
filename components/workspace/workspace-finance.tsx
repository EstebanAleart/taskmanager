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
  TrendingUp,
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

// ─── Types ───────────────────────────────────────────────

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
  account: { id: string; name: string };
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

const BUDGET_STATUS: Record<string, { label: string; color: string; bgColor: string }> = {
  pending: { label: "Pendiente", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  approved: { label: "Aprobado", color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  rejected: { label: "Rechazado", color: "text-red-500", bgColor: "bg-red-500/10" },
};

// ─── Component ───────────────────────────────────────────

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
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);

  // Month filter: null = all, string = "YYYY-MM"
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const base = `/api/workspaces/${workspaceId}`;

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

  // ─── CRUD helpers ──────────────────────────────────────

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
    if (accounts.length === 0 || categories.length === 0) {
      toast.error("Necesitas al menos una cuenta y una categoría");
      return;
    }
    // Pre-fill transaction dialog with budget data
    setEditingItem({
      amount: budget.amount,
      description: `Presupuesto: ${budget.name}`,
      date: new Date().toISOString(),
      account: { id: accounts[0].id },
      category: { id: categories.find((c) => c.type === "expense")?.id || categories[0].id },
    } as unknown as Record<string, unknown>);
    setTransactionDialog(true);
  }

  // Month navigation helpers
  const navigateMonth = (direction: number) => {
    const current = selectedMonth
      ? new Date(parseInt(selectedMonth.split("-")[0]), parseInt(selectedMonth.split("-")[1]) - 1)
      : new Date();
    current.setMonth(current.getMonth() + direction);
    setSelectedMonth(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
  };

  // Filtered transactions by selected month
  const filteredTransactions = selectedMonth
    ? transactions.filter((t) => getMonthKey(t.date) === selectedMonth)
    : transactions;

  // Filtered grouped by month
  const filteredByMonth = selectedMonth
    ? { [selectedMonth]: filteredTransactions }
    : transactionsByMonth;

  const filteredSortedMonths = selectedMonth
    ? [selectedMonth]
    : sortedMonths;

  // Global totals
  const globalTotals = getMonthTotals(filteredTransactions);

  // ─── Account form ──────────────────────────────────────

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
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Banco principal" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Moneda</label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ARS">ARS</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Balance inicial</label>
            <Input type="number" value={balance} onChange={(e) => setBalance(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={saving || !name.trim()} className="w-full">
          {saving ? "Guardando..." : editing ? "Actualizar" : "Crear cuenta"}
        </Button>
      </div>
    );
  }

  // ─── Category form ─────────────────────────────────────

  function CategoryForm() {
    const editing = editingItem as Category | null;
    const [name, setName] = useState(editing?.name || "");
    const [type, setType] = useState(editing?.type || "expense");
    const [color, setColor] = useState(editing?.color || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      if (!name.trim()) return;
      setSaving(true);
      try {
        const url = editing ? `${base}/categories/${editing.id}` : `${base}/categories`;
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
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Alquiler" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tipo</label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="income">Ingreso</SelectItem>
              <SelectItem value="expense">Gasto</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Color</label>
          <Select value={color} onValueChange={setColor}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar color..." />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_COLORS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  <span className="flex items-center gap-2">
                    <span className={cn("h-3 w-3 rounded-full", c.value.replace("text-", "bg-"))} />
                    {c.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} disabled={saving || !name.trim()} className="w-full">
          {saving ? "Guardando..." : editing ? "Actualizar" : "Crear categoría"}
        </Button>
      </div>
    );
  }

  // ─── Transaction form ──────────────────────────────────

  function TransactionForm() {
    const editing = editingItem as (Transaction & { accountId?: string; categoryId?: string }) | null;
    const [amount, setAmount] = useState(editing?.amount?.toString() || "");
    const [description, setDescription] = useState(editing?.description || "");
    const [date, setDate] = useState(
      editing?.date ? new Date(editing.date).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)
    );
    const [accountId, setAccountId] = useState(editing?.account?.id || editing?.accountId || "");
    const [categoryId, setCategoryId] = useState(editing?.category?.id || editing?.categoryId || "");
    const [saving, setSaving] = useState(false);

    const handleSubmit = async () => {
      if (!amount || !accountId || !categoryId) return;
      setSaving(true);
      try {
        const url = editing?.id ? `${base}/transactions/${editing.id}` : `${base}/transactions`;
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Monto</label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Fecha</label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Cuenta</label>
          <Select value={accountId} onValueChange={setAccountId}>
            <SelectTrigger><SelectValue placeholder="Seleccionar cuenta..." /></SelectTrigger>
            <SelectContent>
              {accounts.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name} ({a.currency})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Categoría</label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger><SelectValue placeholder="Seleccionar categoría..." /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.type === "income" ? "↑" : "↓"} {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleSubmit} disabled={saving || !amount || !accountId || !categoryId} className="w-full">
          {saving ? "Guardando..." : editing?.id ? "Actualizar" : "Crear transacción"}
        </Button>
      </div>
    );
  }

  // ─── Budget form ───────────────────────────────────────

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
        <div>
          <label className="mb-1 block text-sm font-medium">Nombre</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Marketing Q1" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Monto</label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Descripción</label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Opcional" />
        </div>
        <Button onClick={handleSubmit} disabled={saving || !name.trim() || !amount} className="w-full">
          {saving ? "Guardando..." : editing ? "Actualizar" : "Crear presupuesto"}
        </Button>
      </div>
    );
  }

  // ─── Render ────────────────────────────────────────────

  const formatCurrency = (amount: number, currency = "ARS") =>
    new Intl.NumberFormat("es-AR", { style: "currency", currency }).format(amount);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" });

  const getMonthKey = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  const formatMonthLabel = (key: string) => {
    const [year, month] = key.split("-");
    const d = new Date(parseInt(year), parseInt(month) - 1);
    return d.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
  };

  // Group transactions by month
  const transactionsByMonth = transactions.reduce<Record<string, Transaction[]>>((acc, txn) => {
    const key = getMonthKey(txn.date);
    if (!acc[key]) acc[key] = [];
    acc[key].push(txn);
    return acc;
  }, {});

  const sortedMonths = Object.keys(transactionsByMonth).sort((a, b) => b.localeCompare(a));

  const getMonthTotals = (txns: Transaction[]) => {
    const income = txns.filter((t) => t.category.type === "income").reduce((s, t) => s + Math.abs(t.amount), 0);
    const expense = txns.filter((t) => t.category.type === "expense").reduce((s, t) => s + Math.abs(t.amount), 0);
    return { income, expense, balance: income - expense };
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground">Finanzas</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Gestiona cuentas, transacciones, categorías y presupuestos
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
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
        <div className="flex items-center justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* ═══ TRANSACCIONES ═══ */}
          {activeTab === "transacciones" && (
            <div>
              {/* Month filter + new button */}
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <button
                    onClick={() => setSelectedMonth(null)}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      selectedMonth === null ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    Todos
                  </button>
                  {selectedMonth && (
                    <span className="text-sm font-medium capitalize text-foreground">
                      {formatMonthLabel(selectedMonth)}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigateMonth(1)}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <Button
                  size="sm"
                  onClick={() => { setEditingItem(null); setTransactionDialog(true); }}
                  disabled={accounts.length === 0 || categories.length === 0}
                >
                  <Plus className="mr-1 h-4 w-4" /> Nueva transacción
                </Button>
              </div>

              {/* Summary cards */}
              {filteredTransactions.length > 0 && (
                <div className="mb-6 grid grid-cols-3 gap-4">
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
                      <span className="text-xs text-muted-foreground">Ingresos</span>
                    </div>
                    <p className="text-lg font-bold text-emerald-500">+{formatCurrency(globalTotals.income)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <ArrowDownCircle className="h-4 w-4 text-red-500" />
                      <span className="text-xs text-muted-foreground">Gastos</span>
                    </div>
                    <p className="text-lg font-bold text-red-500">-{formatCurrency(globalTotals.expense)}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Balance</span>
                    </div>
                    <p className={cn("text-lg font-bold", globalTotals.balance >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {formatCurrency(globalTotals.balance)}
                    </p>
                  </div>
                </div>
              )}

              {accounts.length === 0 || categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <DollarSign className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Primero crea al menos una cuenta y una categoría para registrar transacciones.
                  </p>
                </div>
              ) : filteredTransactions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <DollarSign className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {selectedMonth ? "No hay transacciones en este mes." : "No hay transacciones todavía."}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredSortedMonths.map((monthKey) => {
                    const monthTxns = filteredByMonth[monthKey];
                    const totals = getMonthTotals(monthTxns);
                    return (
                      <div key={monthKey}>
                        {/* Month header */}
                        <div className="mb-3 flex items-center justify-between">
                          <h3 className="text-sm font-semibold capitalize text-foreground">
                            {formatMonthLabel(monthKey)}
                          </h3>
                          <div className="flex items-center gap-4 text-xs">
                            <span className="text-emerald-500">+{formatCurrency(totals.income)}</span>
                            <span className="text-red-500">-{formatCurrency(totals.expense)}</span>
                            <span className={cn(
                              "font-semibold",
                              totals.balance >= 0 ? "text-emerald-500" : "text-red-500"
                            )}>
                              = {formatCurrency(totals.balance)}
                            </span>
                          </div>
                        </div>
                        {/* Month transactions */}
                        <div className="space-y-2">
                          {monthTxns.map((txn) => (
                            <div
                              key={txn.id}
                              className="flex items-center gap-4 rounded-xl border border-border bg-card p-4"
                            >
                              <div className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-full",
                                txn.category.type === "income" ? "bg-emerald-500/10" : "bg-red-500/10"
                              )}>
                                {txn.category.type === "income"
                                  ? <ArrowUpCircle className="h-5 w-5 text-emerald-500" />
                                  : <ArrowDownCircle className="h-5 w-5 text-red-500" />
                                }
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-card-foreground truncate">
                                  {txn.description || txn.category.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <span>{formatDate(txn.date)}</span>
                                  <span>·</span>
                                  <span>{txn.account.name}</span>
                                  {txn.project && (
                                    <>
                                      <span>·</span>
                                      <span className={cn("inline-flex items-center gap-1")}>
                                        <span className={cn("h-1.5 w-1.5 rounded-full", txn.project.color)} />
                                        {txn.project.name}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={cn(
                                  "text-sm font-semibold",
                                  txn.category.type === "income" ? "text-emerald-500" : "text-red-500"
                                )}>
                                  {txn.category.type === "income" ? "+" : "-"}{formatCurrency(Math.abs(txn.amount))}
                                </p>
                                <Badge variant="secondary" className="text-[10px]">
                                  {txn.category.name}
                                </Badge>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => { setEditingItem(txn); setTransactionDialog(true); }}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDelete(`${base}/transactions/${txn.id}`, txn.description || txn.category.name)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
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
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {accounts.length} cuenta{accounts.length !== 1 ? "s" : ""}
                </span>
                <Button size="sm" onClick={() => { setEditingItem(null); setAccountDialog(true); }}>
                  <Plus className="mr-1 h-4 w-4" /> Nueva cuenta
                </Button>
              </div>

              {accounts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No hay cuentas todavía.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {accounts.map((acc) => (
                    <div key={acc.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="font-medium text-card-foreground">{acc.name}</p>
                          {acc.description && (
                            <p className="text-xs text-muted-foreground">{acc.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary">{acc.currency}</Badge>
                      </div>
                      <p className="text-2xl font-bold text-card-foreground">
                        {formatCurrency(acc.balance, acc.currency)}
                      </p>
                      <div className="mt-4 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => { setEditingItem(acc); setAccountDialog(true); }}
                        >
                          <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(`${base}/accounts/${acc.id}`, acc.name)}
                        >
                          <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══ CATEGORÍAS ═══ */}
          {activeTab === "categorias" && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {categories.length} categoría{categories.length !== 1 ? "s" : ""}
                </span>
                <Button size="sm" onClick={() => { setEditingItem(null); setCategoryDialog(true); }}>
                  <Plus className="mr-1 h-4 w-4" /> Nueva categoría
                </Button>
              </div>

              {categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Tag className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No hay categorías todavía.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Ingresos */}
                  {categories.filter((c) => c.type === "income").length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-emerald-500">
                        <ArrowUpCircle className="h-4 w-4" /> Ingresos
                      </h3>
                      <div className="space-y-2">
                        {categories.filter((c) => c.type === "income").map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className={cn("h-3 w-3 rounded-full bg-emerald-500")} />
                              <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingItem(cat); setCategoryDialog(true); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(`${base}/categories/${cat.id}`, cat.name)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gastos */}
                  {categories.filter((c) => c.type === "expense").length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-red-500">
                        <ArrowDownCircle className="h-4 w-4" /> Gastos
                      </h3>
                      <div className="space-y-2">
                        {categories.filter((c) => c.type === "expense").map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className={cn("h-3 w-3 rounded-full bg-red-500")} />
                              <span className="text-sm font-medium">{cat.name}</span>
                            </div>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingItem(cat); setCategoryDialog(true); }}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(`${base}/categories/${cat.id}`, cat.name)}>
                                <Trash2 className="h-3 w-3" />
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
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">
                    {budgets.length} presupuesto{budgets.length !== 1 ? "s" : ""}
                  </span>
                  <span className="ml-3 text-sm font-semibold text-foreground">
                    Total: {formatCurrency(budgets.reduce((s, b) => s + b.amount, 0))}
                  </span>
                </div>
                <Button size="sm" onClick={() => { setEditingItem(null); setBudgetDialog(true); }}>
                  <Plus className="mr-1 h-4 w-4" /> Nuevo presupuesto
                </Button>
              </div>

              {budgets.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <PiggyBank className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No hay presupuestos todavía.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {budgets.map((bud) => {
                    const st = BUDGET_STATUS[bud.status] || BUDGET_STATUS.pending;
                    return (
                      <div key={bud.id} className="rounded-xl border border-border bg-card p-5">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-card-foreground">{bud.name}</p>
                            {bud.description && (
                              <p className="mt-1 text-xs text-muted-foreground">{bud.description}</p>
                            )}
                          </div>
                          <Badge variant="secondary" className={cn("text-xs", st.bgColor, st.color)}>
                            {st.label}
                          </Badge>
                        </div>
                        <p className="mt-3 text-2xl font-bold text-card-foreground">
                          {formatCurrency(bud.amount)}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-1">
                          {bud.status === "pending" && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-emerald-500 hover:bg-emerald-500/10"
                                onClick={() => handleBudgetStatus(bud, "approved")}
                              >
                                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Aprobar
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:bg-red-500/10"
                                onClick={() => handleBudgetStatus(bud, "rejected")}
                              >
                                <XCircle className="mr-1 h-3.5 w-3.5" /> Rechazar
                              </Button>
                            </>
                          )}
                          {bud.status === "approved" && accounts.length > 0 && categories.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-primary"
                              onClick={() => handleBudgetToTransaction(bud)}
                            >
                              <DollarSign className="mr-1 h-3.5 w-3.5" /> Crear transacción
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => { setEditingItem(bud); setBudgetDialog(true); }}
                          >
                            <Pencil className="mr-1 h-3.5 w-3.5" /> Editar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(`${base}/budgets/${bud.id}`, bud.name)}
                          >
                            <Trash2 className="mr-1 h-3.5 w-3.5" /> Eliminar
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
      <Dialog open={accountDialog} onOpenChange={(open) => { setAccountDialog(open); if (!open) setEditingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar cuenta" : "Nueva cuenta"}</DialogTitle>
          </DialogHeader>
          <AccountForm />
        </DialogContent>
      </Dialog>

      <Dialog open={categoryDialog} onOpenChange={(open) => { setCategoryDialog(open); if (!open) setEditingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar categoría" : "Nueva categoría"}</DialogTitle>
          </DialogHeader>
          <CategoryForm />
        </DialogContent>
      </Dialog>

      <Dialog open={transactionDialog} onOpenChange={(open) => { setTransactionDialog(open); if (!open) setEditingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar transacción" : "Nueva transacción"}</DialogTitle>
          </DialogHeader>
          <TransactionForm />
        </DialogContent>
      </Dialog>

      <Dialog open={budgetDialog} onOpenChange={(open) => { setBudgetDialog(open); if (!open) setEditingItem(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? "Editar presupuesto" : "Nuevo presupuesto"}</DialogTitle>
          </DialogHeader>
          <BudgetForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
