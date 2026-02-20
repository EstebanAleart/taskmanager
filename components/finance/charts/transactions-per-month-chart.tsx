import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type TransactionsPerMonthChartProps = {
  data: Array<{ month: string; count: number }>;
};

export const TransactionsPerMonthChart: React.FC<TransactionsPerMonthChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barCategoryGap="40%" barSize={32}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis dataKey="month" tick={{ fontSize: 11 }} />
      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
      <Tooltip />
      <Bar dataKey="count" fill="#6366f1" name="Transacciones" radius={[3, 3, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
