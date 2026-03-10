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
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <h3 className="text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-4">
          Shares Over Time
        </h3>
        <div className="h-52 flex items-center justify-center text-stone-500 text-sm">
          No share data yet
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 card-hover">
      <h3 className="text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-5">
        Shares Over Time (Last 30 Days)
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tick={{ fill: "#78716c", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => {
              const d = new Date(v + "T00:00:00");
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
          />
          <YAxis
            tick={{ fill: "#78716c", fontSize: 10, fontFamily: "var(--font-jetbrains-mono)" }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1c1917",
              border: "1px solid #292524",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#fafaf9",
              fontFamily: "var(--font-jetbrains-mono)",
              padding: "8px 12px",
            }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke="#f97316"
            fill="url(#colorCount)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
