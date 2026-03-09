"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface SharesChartProps {
  data: { date: string; count: number }[];
}

export default function SharesChart({ data }: SharesChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">
          Shares Over Time
        </h3>
        <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
          No share data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">
        Shares Over Time (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            tick={{ fill: "#71717a", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fff",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            fill="url(#colorCount)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
