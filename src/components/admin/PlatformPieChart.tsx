"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS: Record<string, string> = {
  facebook: "#1877F2",
  twitter: "#a8a29e",
  pinterest: "#E60023",
};

interface PlatformPieChartProps {
  data: { platform: string; count: number }[];
}

export default function PlatformPieChart({ data }: PlatformPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <h3 className="text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-4">
          Platform Breakdown
        </h3>
        <div className="h-52 flex items-center justify-center text-stone-500 text-sm">
          No share data yet
        </div>
      </div>
    );
  }

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 card-hover">
      <h3 className="text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-5">
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
            innerRadius={50}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell
                key={entry.platform}
                fill={COLORS[entry.platform] || "#78716c"}
              />
            ))}
          </Pie>
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
            formatter={(value, name) => [
              `${value} (${Math.round((Number(value) / total) * 100)}%)`,
              String(name).charAt(0).toUpperCase() + String(name).slice(1),
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-5 mt-3">
        {data.map((d) => (
          <div key={d.platform} className="flex items-center gap-2 text-xs">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS[d.platform] || "#78716c" }}
            />
            <span className="text-stone-300 capitalize font-medium">{d.platform}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
