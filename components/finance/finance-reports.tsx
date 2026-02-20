"use client";
import React, { useEffect, useState } from "react";
import { BudgetVsActualChart } from "./charts/budget-vs-actual-chart";
import { AccountStackedChart } from "./charts/account-stacked-chart";
import { TopCategoriesChart } from "./charts/top-categories-chart";
import { TransactionsPerMonthChart } from "./charts/transactions-per-month-chart";
import { ProjectExpensesChart } from "./charts/project-expenses-chart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ReportsData = {
  budgetVsActual: Array<{
    budgetId: string;
    budgetName: string;
    budgetAmount: number;
    actualAmount: number;
    currency: string;
  }>;
  accountExpenses: Array<{
    accountId: string;
    accountName: string;
    monthly: Array<{ month: string; value: number; currency: string }>;
  }>;
  topCategories: Array<{
    categoryId: string;
    categoryName: string;
    value: number;
    currency: string;
  }>;
  transactionCounts: Array<{ month: string; count: number }>;
  projectExpenses: Array<{
    projectId: string;
    projectName: string;
    value: number;
    currency: string;
  }>;
};

interface FinanceReportsProps {
  workspaceId: string;
  accounts: Array<{ id: string; name: string }>;
  categories: Array<{ id: string; name: string }>;
  projects: Array<{ id: string; name: string }>;
}

export const FinanceReports: React.FC<FinanceReportsProps> = ({
  workspaceId,
  accounts,
  categories,
  projects,
}) => {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [projectId, setProjectId] = useState("");

  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (accountId) params.set("accountId", accountId);
    if (categoryId) params.set("categoryId", categoryId);
    if (projectId) params.set("projectId", projectId);

    fetch(`/api/workspaces/${workspaceId}/finance/reports?${params}`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(res.statusText)
      )
      .then(setData)
      .catch((err) =>
        setError(typeof err === "string" ? err : "Error al cargar reportes")
      )
      .finally(() => setLoading(false));
  }, [workspaceId, dateFrom, dateTo, accountId, categoryId, projectId]);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
    setAccountId("");
    setCategoryId("");
    setProjectId("");
  };

  const hasFilters = dateFrom || dateTo || accountId || categoryId || projectId;

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-2 items-start sm:items-center">
        <Input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="w-full sm:w-auto text-sm"
          placeholder="Desde"
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="w-full sm:w-auto text-sm"
          placeholder="Hasta"
        />
        <Select
          value={accountId || "__all__"}
          onValueChange={(v) => setAccountId(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px] text-sm">
            <SelectValue placeholder="Cuenta" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las cuentas</SelectItem>
            {accounts.map((acc) => (
              <SelectItem key={acc.id} value={acc.id}>
                {acc.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={categoryId || "__all__"}
          onValueChange={(v) => setCategoryId(v === "__all__" ? "" : v)}
        >
          <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px] text-sm">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Todas las categorías</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {projects.length > 0 && (
          <Select
            value={projectId || "__all__"}
            onValueChange={(v) => setProjectId(v === "__all__" ? "" : v)}
          >
            <SelectTrigger className="w-full sm:w-auto sm:min-w-[150px] text-sm">
              <SelectValue placeholder="Proyecto" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos los proyectos</SelectItem>
              {projects.map((proj) => (
                <SelectItem key={proj.id} value={proj.id}>
                  {proj.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Limpiar
          </Button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-muted/20 animate-pulse rounded-xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-sm text-destructive border border-destructive/20 rounded-lg p-4">
          {error}
        </div>
      )}

      {/* Charts — 2-col grid on desktop */}
      {!loading && data && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {data.budgetVsActual.length > 0 && (
              <div className="bg-card rounded-xl p-4 border flex flex-col gap-3">
                <h3 className="font-medium text-sm">Presupuesto vs Real</h3>
                <BudgetVsActualChart data={data.budgetVsActual} />
              </div>
            )}
            {data.transactionCounts.length > 0 && (
              <div className="bg-card rounded-xl p-4 border flex flex-col gap-3">
                <h3 className="font-medium text-sm">Transacciones por mes</h3>
                <TransactionsPerMonthChart data={data.transactionCounts} />
              </div>
            )}
            {data.topCategories.length > 0 && (
              <div className="bg-card rounded-xl p-4 border flex flex-col gap-3">
                <h3 className="font-medium text-sm">Top 5 categorías de gasto</h3>
                <TopCategoriesChart data={data.topCategories} />
              </div>
            )}
            {data.projectExpenses.length > 0 && (
              <div className="bg-card rounded-xl p-4 border flex flex-col gap-3">
                <h3 className="font-medium text-sm">Gastos por proyecto</h3>
                <ProjectExpensesChart data={data.projectExpenses} />
              </div>
            )}
          </div>
          {/* Stacked account chart — full width (needs more horizontal space) */}
          {data.accountExpenses.length > 0 && (
            <div className="bg-card rounded-xl p-4 border flex flex-col gap-3">
              <h3 className="font-medium text-sm">Gastos por cuenta — mensual</h3>
              <AccountStackedChart data={data.accountExpenses} />
            </div>
          )}
          {data.budgetVsActual.length === 0 &&
            data.accountExpenses.length === 0 &&
            data.topCategories.length === 0 &&
            data.transactionCounts.length === 0 &&
            data.projectExpenses.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-12">
                Sin datos para el período seleccionado.
              </p>
            )}
        </div>
      )}
    </div>
  );
};
