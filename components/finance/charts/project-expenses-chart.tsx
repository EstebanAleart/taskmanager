import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export type ProjectExpensesChartProps = {
  data: Array<{
    projectId: string;
    projectName: string;
    value: number;
    currency: string;
  }>;
};

function formatAmount(value: number) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0,
  }).format(value);
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: ProjectExpensesChartProps["data"][number] }>;
}) => {
  if (active && payload && payload.length) {
    const { projectName, value, currency } = payload[0].payload;
    return (
      <div className="bg-popover border rounded-md px-3 py-2 text-xs shadow-md">
        <p className="font-semibold mb-0.5">{projectName}</p>
        <p className="text-muted-foreground">
          {currency} {formatAmount(value)}
        </p>
      </div>
    );
  }
  return null;
};

export const ProjectExpensesChart: React.FC<ProjectExpensesChartProps> = ({
  data,
}) => {
  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-8">
        Sin gastos vinculados a proyectos.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={formatAmount} />
        <YAxis
          dataKey="projectName"
          type="category"
          tick={{ fontSize: 11 }}
          width={120}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="value" fill="#6366f1" name="Gasto" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
