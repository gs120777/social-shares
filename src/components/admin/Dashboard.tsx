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

const platformColors: Record<string, string> = {
  facebook: "text-[#1877F2]",
  twitter: "text-stone-50",
  pinterest: "text-[#E60023]",
};

const platformIcons: Record<string, string> = {
  facebook: "FB",
  twitter: "X",
  pinterest: "Pin",
};

export default function Dashboard({ projectId }: { projectId?: number } = {}) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const endpoint = projectId
      ? `/api/admin/projects/${projectId}/stats`
      : "/api/admin/stats";
    fetch(endpoint)
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <div className="space-y-6 stagger-children">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 h-24 shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-stone-900 border border-stone-800 rounded-2xl h-80 shimmer" />
          <div className="bg-stone-900 border border-stone-800 rounded-2xl h-80 shimmer" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-stone-500">
        Failed to load dashboard data
      </div>
    );
  }

  return (
    <div className="space-y-6 stagger-children">
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
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 card-hover">
          <h3 className="text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-4">
            Top URLs by Shares
          </h3>
          {stats.topUrls.length === 0 ? (
            <p className="text-stone-500 text-sm py-6 text-center">
              No data yet
            </p>
          ) : (
            <div className="space-y-2.5">
              {stats.topUrls.map((url, i) => (
                <div
                  key={url.id}
                  className="flex items-center gap-3 text-sm group"
                >
                  <span className="text-stone-500 w-5 text-right font-mono text-xs">
                    {i + 1}
                  </span>
                  <span className="text-stone-50 flex-1 truncate group-hover:text-orange-500 transition-colors">
                    {url.title}
                  </span>
                  <span className="text-stone-400 font-mono text-xs bg-stone-800 px-2 py-0.5 rounded-md">
                    {url.shares}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5 card-hover">
          <h3 className="text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-4">
            Recent Activity
          </h3>
          {stats.recentShares.length === 0 ? (
            <p className="text-stone-500 text-sm py-6 text-center">
              No activity yet
            </p>
          ) : (
            <div className="space-y-2.5">
              {stats.recentShares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`text-[10px] font-bold w-7 ${platformColors[share.platform] || "text-stone-500"}`}
                  >
                    {platformIcons[share.platform]}
                  </span>
                  <span className="text-stone-300 flex-1 truncate">
                    {share.urlTitle}
                  </span>
                  <span className="text-stone-500 text-[10px] font-mono">
                    {share.sessionId.slice(0, 8)}
                  </span>
                  <span className="text-stone-500 text-[10px] font-mono">
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
