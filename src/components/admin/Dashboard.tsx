"use client";

import { useEffect, useState } from "react";
import StatsCards from "./StatsCards";
import SharesChart from "./SharesChart";
import PlatformPieChart from "./PlatformPieChart";

interface StatsData {
  totalShares: number;
  sharesToday: number;
  activeUrls: number;
  uniqueVisitors: number;
  sharesByPlatform: { platform: string; count: number }[];
  topUrls: { id: number; title: string; url: string; shares: number }[];
  timeline: { date: string; count: number }[];
  recentShares: {
    id: number;
    platform: string;
    urlTitle: string;
    sessionId: string;
    createdAt: string;
  }[];
}

const platformIcons: Record<string, string> = {
  facebook: "FB",
  twitter: "X",
  pinterest: "Pin",
};

export default function Dashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Loading dashboard...
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards
        totalShares={stats.totalShares}
        sharesToday={stats.sharesToday}
        uniqueVisitors={stats.uniqueVisitors}
        activeUrls={stats.activeUrls}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SharesChart data={stats.timeline} />
        </div>
        <div>
          <PlatformPieChart data={stats.sharesByPlatform} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top URLs */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            Top URLs by Shares
          </h3>
          {stats.topUrls.length === 0 ? (
            <p className="text-zinc-600 text-sm py-4 text-center">
              No data yet
            </p>
          ) : (
            <div className="space-y-2">
              {stats.topUrls.map((url, i) => (
                <div
                  key={url.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-zinc-600 w-5 text-right font-mono">
                    {i + 1}
                  </span>
                  <span className="text-white flex-1 truncate">
                    {url.title}
                  </span>
                  <span className="text-zinc-400 font-mono">
                    {url.shares}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            Recent Activity
          </h3>
          {stats.recentShares.length === 0 ? (
            <p className="text-zinc-600 text-sm py-4 text-center">
              No activity yet
            </p>
          ) : (
            <div className="space-y-2">
              {stats.recentShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`text-xs font-bold w-7 ${
                      share.platform === "facebook"
                        ? "text-blue-400"
                        : share.platform === "twitter"
                          ? "text-white"
                          : "text-red-400"
                    }`}
                  >
                    {platformIcons[share.platform]}
                  </span>
                  <span className="text-zinc-300 flex-1 truncate">
                    {share.urlTitle}
                  </span>
                  <span className="text-zinc-600 text-xs font-mono">
                    {share.sessionId}
                  </span>
                  <span className="text-zinc-600 text-xs">
                    {new Date(share.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
