import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type BalanceAreaChartProps = {
  data: Array<{ month: string; income: number; expense: number; balance: number; currency: string }>;
};

export const BalanceAreaChart: React.FC<BalanceAreaChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={210}>
    <AreaChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} />
      <Tooltip />
      <Legend />
      <Area type="monotone" dataKey="income" stroke="#10b981" fill="#d1fae5" name="Ingresos" />
      <Area type="monotone" dataKey="expense" stroke="#ef4444" fill="#fee2e2" name="Gastos" />
      <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#dbeafe" name="Balance" />
    </AreaChart>
  </ResponsiveContainer>
);
