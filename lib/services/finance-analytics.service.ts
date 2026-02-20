import { prisma } from "@/lib/prisma";
import { addMonths, format } from "date-fns";

export type DashboardKPI = {
  balance: number;
  incomeCurrent: number;
  expenseCurrent: number;
  variation: number;
  currency: string;
};

export type MonthlyEvolution = {
  month: string;
  income: number;
  expense: number;
  balance: number;
  currency: string;
};

export type CategoryExpense = {
  categoryId: string;
  categoryName: string;
  value: number;
  currency: string;
};

export type AccountBalance = {
  accountId: string;
  accountName: string;
  balance: number;
  currency: string;
};

export type DashboardData = {
  kpis: DashboardKPI[];
  monthlyEvolution: MonthlyEvolution[];
  incomeExpense: MonthlyEvolution[];
  categoryExpenses: CategoryExpense[];
  incomeByCategory: CategoryExpense[];
  accountBalances: AccountBalance[];
};

export type ReportFilters = {
  dateFrom?: string;
  dateTo?: string;
  accountId?: string;
  categoryId?: string;
  projectId?: string;
};

export type BudgetVsActual = {
  budgetId: string;
  budgetName: string;
  budgetAmount: number;
  actualAmount: number;
  currency: string;
};

export type AccountExpense = {
  accountId: string;
  accountName: string;
  monthly: { month: string; value: number; currency: string }[];
};

export type TopCategory = {
  categoryId: string;
  categoryName: string;
  value: number;
  currency: string;
};

export type TransactionCount = {
  month: string;
  count: number;
};

export type ProjectExpense = {
  projectId: string;
  projectName: string;
  value: number;
  currency: string;
};

export type ReportsData = {
  budgetVsActual: BudgetVsActual[];
  accountExpenses: AccountExpense[];
  topCategories: TopCategory[];
  transactionCounts: TransactionCount[];
  projectExpenses: ProjectExpense[];
};

const TRANSFER_NAMES = ["Transferencia (entrada)", "Transferencia (salida)"];

export class FinanceAnalyticsService {
  static async getDashboard(workspaceId: string): Promise<DashboardData> {
    const transactions = await prisma.financialTransaction.findMany({
      where: {
        workspaceId,
        category: { name: { notIn: TRANSFER_NAMES } },
      },
      include: { account: true, category: true },
    });

    const currencies = Array.from(
      new Set(transactions.map((t) => t.account.currency))
    );

    const now = new Date();
    const monthKey = format(now, "yyyy-MM");
    const prevMonthKey = format(addMonths(now, -1), "yyyy-MM");

    // KPIs per currency
    const kpis: DashboardKPI[] = currencies.map((currency) => {
      const txns = transactions.filter((t) => t.account.currency === currency);
      const balance = txns
        .filter((t) => t.category.type === "income")
        .reduce((s, t) => s + t.amount, 0)
        - txns
          .filter((t) => t.category.type === "expense")
          .reduce((s, t) => s + t.amount, 0);

      const incomeCurrent = txns
        .filter(
          (t) =>
            t.category.type === "income" &&
            format(t.date, "yyyy-MM") === monthKey
        )
        .reduce((s, t) => s + t.amount, 0);

      const expenseCurrent = txns
        .filter(
          (t) =>
            t.category.type === "expense" &&
            format(t.date, "yyyy-MM") === monthKey
        )
        .reduce((s, t) => s + t.amount, 0);

      const incomePrev = txns
        .filter(
          (t) =>
            t.category.type === "income" &&
            format(t.date, "yyyy-MM") === prevMonthKey
        )
        .reduce((s, t) => s + t.amount, 0);

      const variation =
        incomePrev === 0
          ? 0
          : ((incomeCurrent - incomePrev) / incomePrev) * 100;

      return { balance, incomeCurrent, expenseCurrent, variation, currency };
    });

    // Monthly evolution per currency
    const allMonths = Array.from(
      new Set(transactions.map((t) => format(t.date, "yyyy-MM")))
    ).sort();

    const monthlyEvolution: MonthlyEvolution[] = [];
    currencies.forEach((currency) => {
      allMonths.forEach((month) => {
        const txns = transactions.filter(
          (t) =>
            t.account.currency === currency &&
            format(t.date, "yyyy-MM") === month
        );
        const income = txns
          .filter((t) => t.category.type === "income")
          .reduce((s, t) => s + t.amount, 0);
        const expense = txns
          .filter((t) => t.category.type === "expense")
          .reduce((s, t) => s + t.amount, 0);
        monthlyEvolution.push({ month, income, expense, balance: income - expense, currency });
      });
    });

    // Helper: group transactions by category for a given type and month
    const groupByCategory = (type: "income" | "expense", currency: string, month: string): CategoryExpense[] => {
      const txns = transactions.filter(
        (t) =>
          t.account.currency === currency &&
          format(t.date, "yyyy-MM") === month &&
          t.category.type === type
      );
      const grouped = txns.reduce(
        (acc, t) => {
          acc[t.category.id] = (acc[t.category.id] ?? 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );
      return Object.entries(grouped).map(([categoryId, value]) => ({
        categoryId,
        categoryName: txns.find((t) => t.category.id === categoryId)?.category.name ?? "",
        value,
        currency,
      }));
    };

    // Expense by category — current month, per currency
    const categoryExpenses: CategoryExpense[] = currencies.flatMap((currency) =>
      groupByCategory("expense", currency, monthKey)
    );

    // Income by category — current month, per currency
    const incomeByCategory: CategoryExpense[] = currencies.flatMap((currency) =>
      groupByCategory("income", currency, monthKey)
    );

    // Account balances from DB (actual running balance field)
    const dbAccounts = await prisma.financialAccount.findMany({
      where: { workspaceId },
      orderBy: { name: "asc" },
    });
    const accountBalances: AccountBalance[] = dbAccounts.map((a) => ({
      accountId: a.id,
      accountName: a.name,
      balance: a.balance,
      currency: a.currency,
    }));

    return {
      kpis,
      monthlyEvolution,
      incomeExpense: monthlyEvolution,
      categoryExpenses,
      incomeByCategory,
      accountBalances,
    };
  }

  static async getReports(
    workspaceId: string,
    filters: ReportFilters
  ): Promise<ReportsData> {
    const { dateFrom, dateTo, accountId, categoryId, projectId } = filters;

    const transactions = await prisma.financialTransaction.findMany({
      where: {
        workspaceId,
        category: { name: { notIn: TRANSFER_NAMES } },
        ...(dateFrom && { date: { gte: new Date(dateFrom) } }),
        ...(dateTo && { date: { lte: new Date(dateTo) } }),
        ...(accountId && { accountId }),
        ...(categoryId && { categoryId }),
        ...(projectId && { projectId }),
      },
      include: { account: true, category: true, project: true },
    });

    const budgets = await prisma.budget.findMany({ where: { workspaceId } });

    // Budget vs Actual:
    // Since Budget has no FK to categories/transactions we compare
    // total budgeted amount vs total actual expenses in the filtered period.
    const totalBudgeted = budgets.reduce((s, b) => s + b.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.category.type === "expense")
      .reduce((s, t) => s + t.amount, 0);

    const budgetVsActual: BudgetVsActual[] =
      budgets.length === 0
        ? []
        : [
            {
              budgetId: "total",
              budgetName: "Total",
              budgetAmount: totalBudgeted,
              actualAmount: totalExpenses,
              currency: "ARS",
            },
            ...budgets.map((b) => ({
              budgetId: b.id,
              budgetName: b.name,
              budgetAmount: b.amount,
              actualAmount: 0, // no direct link to transactions
              currency: "ARS",
            })),
          ];

    // Account expenses — monthly stacked
    const allMonths = Array.from(
      new Set(transactions.map((t) => format(t.date, "yyyy-MM")))
    ).sort();

    const uniqueAccountIds = Array.from(
      new Set(transactions.map((t) => t.account.id))
    );

    const accountExpenses: AccountExpense[] = uniqueAccountIds.map(
      (accId) => {
        const accTxns = transactions.filter((t) => t.account.id === accId);
        const accountName = accTxns[0]?.account.name ?? "";
        const currency = accTxns[0]?.account.currency ?? "ARS";
        const monthly = allMonths.map((month) => {
          const value = accTxns
            .filter(
              (t) =>
                t.category.type === "expense" &&
                format(t.date, "yyyy-MM") === month
            )
            .reduce((s, t) => s + t.amount, 0);
          return { month, value, currency };
        });
        return { accountId: accId, accountName, monthly };
      }
    );

    // Top 5 expense categories
    const grouped = transactions
      .filter((t) => t.category.type === "expense")
      .reduce(
        (acc, t) => {
          acc[t.category.id] = (acc[t.category.id] ?? 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const topCategories: TopCategory[] = Object.entries(grouped)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([catId, value]) => {
        const t = transactions.find((tx) => tx.category.id === catId);
        return {
          categoryId: catId,
          categoryName: t?.category.name ?? "",
          value,
          currency: t?.account.currency ?? "ARS",
        };
      });

    // Transaction count per month
    const transactionCounts: TransactionCount[] = allMonths.map((month) => ({
      month,
      count: transactions.filter((t) => format(t.date, "yyyy-MM") === month)
        .length,
    }));

    // Expenses per project (only transactions linked to a project)
    const projectGrouped = transactions
      .filter((t) => t.category.type === "expense" && t.project)
      .reduce(
        (acc, t) => {
          const pid = t.project!.id;
          acc[pid] = (acc[pid] ?? 0) + t.amount;
          return acc;
        },
        {} as Record<string, number>
      );

    const projectExpenses: ProjectExpense[] = Object.entries(projectGrouped)
      .sort(([, a], [, b]) => b - a)
      .map(([pid, value]) => {
        const t = transactions.find((tx) => tx.project?.id === pid);
        return {
          projectId: pid,
          projectName: t?.project?.name ?? "",
          value,
          currency: t?.account.currency ?? "ARS",
        };
      });

    return { budgetVsActual, accountExpenses, topCategories, transactionCounts, projectExpenses };
  }
}
