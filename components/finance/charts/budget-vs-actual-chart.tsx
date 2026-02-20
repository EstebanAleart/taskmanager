import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type BudgetVsActualChartProps = {
  data: Array<{
    budgetId: string;
    budgetName: string;
    budgetAmount: number;
    actualAmount: number;
    currency: string;
  }>;
};

export const BudgetVsActualChart: React.FC<BudgetVsActualChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="40%" barSize={36}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="budgetName" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="budgetAmount" fill="#a78bfa" name="Presupuesto" radius={[3, 3, 0, 0]} />
        <Bar dataKey="actualAmount" fill="#ef4444" name="Real" radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
