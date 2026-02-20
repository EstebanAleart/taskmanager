import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export type AccountBalanceChartProps = {
  data: Array<{
    accountId: string;
    accountName: string;
    balance: number;
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
  payload?: Array<{ payload: AccountBalanceChartProps["data"][number] }>;
}) => {
  if (active && payload && payload.length) {
    const { accountName, balance, currency } = payload[0].payload;
    return (
      <div className="bg-popover border rounded-md px-3 py-2 text-xs shadow-md">
        <p className="font-semibold mb-0.5">{accountName}</p>
        <p className="text-muted-foreground">
          {currency} {formatAmount(balance)}
        </p>
      </div>
    );
  }
  return null;
};

export const AccountBalanceChart: React.FC<AccountBalanceChartProps> = ({
  data,
}) => {
  if (data.length === 0) {
    return (
      <p className="text-xs text-muted-foreground text-center py-8">
        Sin cuentas registradas.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={data}
        margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="accountName" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={formatAmount} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="balance" name="Balance" radius={[4, 4, 0, 0]}>
          {data.map((entry) => (
            <Cell
              key={entry.accountId}
              fill={entry.balance >= 0 ? "#10b981" : "#ef4444"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
