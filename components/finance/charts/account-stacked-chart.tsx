import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type AccountStackedChartProps = {
  data: Array<{
    accountId: string;
    accountName: string;
    monthly: Array<{ month: string; value: number; currency: string }>;
  }>;
};

const ACCOUNT_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#a78bfa", "#f472b6",
  "#06b6d4", "#ef4444", "#facc15",
];

export const AccountStackedChart: React.FC<AccountStackedChartProps> = ({
  data,
}) => {
  const months = Array.from(
    new Set(data.flatMap((acc) => acc.monthly.map((m) => m.month)))
  ).sort();

  const chartData = months.map((month) => {
    const row: Record<string, string | number> = { month };
    data.forEach((acc) => {
      const entry = acc.monthly.find((m) => m.month === month);
      row[acc.accountName] = entry?.value ?? 0;
    });
    return row;
  });

  if (chartData.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-8">
        Sin datos para el período seleccionado.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={210}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="35%" barSize={28}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        {data.map((acc, idx) => (
          <Bar
            key={acc.accountId}
            dataKey={acc.accountName}
            stackId="a"
            fill={ACCOUNT_COLORS[idx % ACCOUNT_COLORS.length]}
            name={acc.accountName}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};
