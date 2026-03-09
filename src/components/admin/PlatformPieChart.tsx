"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS: Record<string, string> = {
  facebook: "#1877F2",
  twitter: "#000000",
  pinterest: "#E60023",
};

interface PlatformPieChartProps {
  data: { platform: string; count: number }[];
}

export default function PlatformPieChart({ data }: PlatformPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
        <h3 className="text-sm font-medium text-zinc-400 mb-4">
          Platform Breakdown
        </h3>
        <div className="h-48 flex items-center justify-center text-zinc-600 text-sm">
          No share data yet
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <h3 className="text-sm font-medium text-zinc-400 mb-4">
        Platform Breakdown
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="platform"
            cx="50%"
            cy="50%"
            outerRadius={80}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.platform}
                fill={COLORS[entry.platform] || "#71717a"}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: "#18181b",
              border: "1px solid #27272a",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#fff",
            }}
            formatter={(value, name) => [
              `${value} (${Math.round((Number(value) / total) * 100)}%)`,
              String(name).charAt(0).toUpperCase() + String(name).slice(1),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((d) => (
          <div key={d.platform} className="flex items-center gap-1.5 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: COLORS[d.platform] || "#71717a" }}
            />
            <span className="text-zinc-400 capitalize">{d.platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
