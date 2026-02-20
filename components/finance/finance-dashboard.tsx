"use client";
import React, { useEffect, useState } from "react";
import { BalanceAreaChart } from "./charts/balance-area-chart";
import { IncomeExpenseBar } from "./charts/income-expense-bar";
import { CategoryPie } from "./charts/category-pie";
import { AccountBalanceChart } from "./charts/account-balance-chart";

export type DashboardData = {
  kpis: Array<{
    balance: number;
    incomeCurrent: number;
    expenseCurrent: number;
    variation: number;
    currency: string;
  }>;
  monthlyEvolution: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
    currency: string;
  }>;
  incomeExpense: Array<{
    month: string;
    income: number;
    expense: number;
    balance: number;
    currency: string;
  }>;
  categoryExpenses: Array<{
    categoryId: string;
    categoryName: string;
    value: number;
    currency: string;
  }>;
  incomeByCategory: Array<{
    categoryId: string;
    categoryName: string;
    value: number;
    currency: string;
  }>;
  accountBalances: Array<{
    accountId: string;
    accountName: string;
    balance: number;
    currency: string;
  }>;
};

function formatCurrency(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

interface FinanceDashboardProps {
  workspaceId: string;
}

const ChartCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="bg-card rounded-xl p-4 border flex flex-col gap-3">
    <h3 className="font-medium text-sm text-foreground">{title}</h3>
    {children}
  </div>
);

export const FinanceDashboard: React.FC<FinanceDashboardProps> = ({
  workspaceId,
}) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/workspaces/${workspaceId}/finance/dashboard`)
      .then((res) =>
        res.ok ? res.json() : Promise.reject(res.statusText)
      )
      .then(setData)
      .catch((err) =>
        setError(typeof err === "string" ? err : "Error al cargar dashboard")
      )
      .finally(() => setLoading(false));
  }, [workspaceId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/20 animate-pulse rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-56 bg-muted/20 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-destructive border border-destructive/20 rounded-lg p-4">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const expenseCurrencies = Array.from(
    new Set(data.categoryExpenses.map((c) => c.currency))
  );
  const incomeCurrencies = Array.from(
    new Set(data.incomeByCategory.map((c) => c.currency))
  );
  const evolutionCurrencies = Array.from(
    new Set(data.monthlyEvolution.map((m) => m.currency))
  );

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {data.kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="bg-card rounded-xl p-3 border flex flex-col gap-1.5"
          >
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {kpi.currency}
            </span>
            <span className="text-lg font-bold truncate">
              {formatCurrency(kpi.balance, kpi.currency)}
            </span>
            <div className="text-xs space-y-0.5">
              <div className="flex justify-between gap-1">
                <span className="text-muted-foreground truncate">Ingresos</span>
                <span className="text-emerald-500 font-semibold whitespace-nowrap">
                  +{formatCurrency(kpi.incomeCurrent, kpi.currency)}
                </span>
              </div>
              <div className="flex justify-between gap-1">
                <span className="text-muted-foreground truncate">Gastos</span>
                <span className="text-red-500 font-semibold whitespace-nowrap">
                  -{formatCurrency(kpi.expenseCurrent, kpi.currency)}
                </span>
              </div>
              <div className="flex justify-between gap-1">
                <span className="text-muted-foreground truncate">vs ant.</span>
                <span
                  className={
                    kpi.variation >= 0 ? "text-emerald-500" : "text-red-500"
                  }
                >
                  {kpi.variation >= 0 ? "+" : ""}
                  {kpi.variation.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts grid — 2 cols on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account balances */}
        {data.accountBalances.length > 0 && (
          <ChartCard title="Balance por cuenta">
            <AccountBalanceChart data={data.accountBalances} />
          </ChartCard>
        )}

        {/* Evolution + income/expense per currency — each pair in the same col */}
        {evolutionCurrencies.map((currency) => {
          const evData = data.monthlyEvolution.filter(
            (m) => m.currency === currency
          );
          if (evData.length === 0) return null;
          return (
            <ChartCard key={`ev-${currency}`} title={`Evolución mensual — ${currency}`}>
              <BalanceAreaChart data={evData} />
            </ChartCard>
          );
        })}

        {evolutionCurrencies.map((currency) => {
          const evData = data.incomeExpense.filter(
            (m) => m.currency === currency
          );
          if (evData.length === 0) return null;
          return (
            <ChartCard key={`ie-${currency}`} title={`Ingresos vs Gastos — ${currency}`}>
              <IncomeExpenseBar data={evData} />
            </ChartCard>
          );
        })}

        {/* Expense by category */}
        {expenseCurrencies.map((currency) => {
          const pieData = data.categoryExpenses.filter(
            (c) => c.currency === currency
          );
          return (
            <ChartCard
              key={`exp-${currency}`}
              title={`Gastos por categoría (mes actual) — ${currency}`}
            >
              <CategoryPie data={pieData} currency={currency} />
            </ChartCard>
          );
        })}

        {/* Income by category */}
        {incomeCurrencies.map((currency) => {
          const pieData = data.incomeByCategory.filter(
            (c) => c.currency === currency
          );
          if (pieData.length === 0) return null;
          return (
            <ChartCard
              key={`inc-${currency}`}
              title={`Ingresos por categoría (mes actual) — ${currency}`}
            >
              <CategoryPie data={pieData} currency={currency} />
            </ChartCard>
          );
        })}
      </div>
    </div>
  );
};
