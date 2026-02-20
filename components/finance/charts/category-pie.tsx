import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type CategoryPieProps = {
  data: Array<{
    categoryId: string;
    categoryName: string;
    value: number;
    currency: string;
  }>;
  currency: string;
};

const COLORS = [
  "#10b981", "#ef4444", "#3b82f6", "#f59e0b", "#a78bfa",
  "#f472b6", "#06b6d4", "#facc15", "#6366f1", "#34d399",
  "#fbbf24", "#a3e635", "#f87171", "#818cf8", "#fca5a5",
];

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

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: CategoryPieProps["data"][number] }>;
}) => {
  if (active && payload && payload.length) {
    const { categoryName, value, currency } = payload[0].payload;
    return (
      <div className="bg-popover border rounded-md px-3 py-2 text-xs shadow-md">
        <p className="font-semibold mb-0.5">{categoryName}</p>
        <p className="text-muted-foreground">{formatCurrency(value, currency)}</p>
      </div>
    );
  }
  return null;
};

export const CategoryPie: React.FC<CategoryPieProps> = ({ data, currency }) => {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-8">
        Sin gastos registrados este mes.
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground text-center">
        Total {currency}: <span className="font-semibold text-foreground">{formatCurrency(total, currency)}</span>
      </p>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="categoryName"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
          >
            {data.map((entry, idx) => (
              <Cell key={entry.categoryId} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
