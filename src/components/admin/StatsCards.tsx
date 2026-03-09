"use client";

interface StatsCardsProps {
  totalShares: number;
  sharesToday: number;
  uniqueVisitors: number;
  activeUrls: number;
}

const cards = [
  { key: "totalShares", label: "Total Shares" },
  { key: "sharesToday", label: "Shares Today" },
  { key: "uniqueVisitors", label: "Unique Workers" },
  { key: "activeUrls", label: "Active URLs" },
] as const;

export default function StatsCards(props: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4"
        >
          <p className="text-xs text-zinc-500 uppercase tracking-wider">
            {card.label}
          </p>
          <p className="text-2xl font-bold text-white mt-1">
            {props[card.key].toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}
