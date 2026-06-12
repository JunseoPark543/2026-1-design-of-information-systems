"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/format";
import type { AdminMenuMetric } from "@/lib/types";

export function AdminChart({ data }: { data: AdminMenuMetric[] }) {
  const chartData = data.slice(0, 8).map((item) => ({ name: item.name, sales: item.sold_count, revenue: item.revenue }));
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 12, bottom: 24, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={60} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value, name) => (name === "revenue" ? formatCurrency(Number(value)) : `${value}개`)} />
          <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} name="판매량" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
