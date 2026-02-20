import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export type TopCategoriesChartProps = {
  data: Array<{
    categoryId: string;
    categoryName: string;
    value: number;
    currency: string;
  }>;
};

export const TopCategoriesChart: React.FC<TopCategoriesChartProps> = ({ data }) => (
  <ResponsiveContainer width="100%" height={220}>
    <BarChart data={data} layout="vertical" margin={{ top: 8, right: 16, left: 0, bottom: 0 }} barSize={20}>
      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
      <XAxis type="number" tick={{ fontSize: 11 }} />
      <YAxis dataKey="categoryName" type="category" tick={{ fontSize: 11 }} width={110} />
      <Tooltip />
      <Bar dataKey="value" fill="#ef4444" name="Gasto" radius={[0, 3, 3, 0]} />
    </BarChart>
  </ResponsiveContainer>
);
