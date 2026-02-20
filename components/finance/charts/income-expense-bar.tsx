import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type IncomeExpenseBarProps = {
  data: Array<{ month: string; income: number; expense: number; currency: string }>;
};

export const IncomeExpenseBar: React.FC<IncomeExpenseBarProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="35%" barSize={28}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} />
      <Tooltip />
      <Legend />
      <Bar dataKey="income" fill="#10b981" name="Ingresos" radius={[3, 3, 0, 0]} />
      <Bar dataKey="expense" fill="#ef4444" name="Gastos" radius={[3, 3, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
