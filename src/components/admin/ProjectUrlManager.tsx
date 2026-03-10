"use client";

import { useEffect, useState } from "react";

interface AssignedUrl {
  projectUrlId: number;
  id: number;
  title: string;
  url: string;
  description: string | null;
  shares: number;
}

interface AvailableUrl {
  id: number;
  title: string;
  url: string;
}

interface ProjectInfo {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export default function ProjectUrlManager({
  project,
}: {
  project: ProjectInfo;
}) {
  const [assigned, setAssigned] = useState<AssignedUrl[]>([]);
  const [available, setAvailable] = useState<AvailableUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUrlId, setSelectedUrlId] = useState("");
  const [adding, setAdding] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  async function fetchUrls() {
    const res = await fetch(`/api/admin/projects/${project.id}/urls`);
    const data = await res.json();
    setAssigned(data.assigned);
    setAvailable(data.available);
    setLoading(false);
  }

  useEffect(() => {
    fetchUrls();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addUrl() {
    if (!selectedUrlId) return;
    setAdding(true);
    try {
      await fetch(`/api/admin/projects/${project.id}/urls`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urlId: Number(selectedUrlId) }),
      });
      setSelectedUrlId("");
      await fetchUrls();
    } catch {
      // ignore
    } finally {
      setAdding(false);
    }
  }

  async function removeUrl(urlId: number) {
    await fetch(`/api/admin/projects/${project.id}/urls`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ urlId }),
    });
    await fetchUrls();
  }

  function copyProjectLink() {
    const url = `${window.location.origin}/p/${project.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  }

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl h-24 shimmer" />
        <div className="bg-stone-900 border border-stone-800 rounded-2xl h-64 shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Info Card */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-stone-50">
              {project.name}
            </h3>
            {project.description && (
              <p className="text-sm text-stone-400 mt-0.5">
                {project.description}
              </p>
            )}
          </div>
          <button
            onClick={copyProjectLink}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 shrink-0 ${
              copiedLink
                ? "bg-green-500/10 text-green-400 border border-green-500/30"
                : "bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40"
            }`}
          >
            {copiedLink ? (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 12.75l6 6 9-13.5"
                  />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.928-2.006a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374"
                  />
                </svg>
                Copy Worker Link
              </>
            )}
          </button>
        </div>
        <div className="mt-3 px-3 py-2 bg-stone-950/80 border border-stone-800 rounded-lg">
          <p className="text-xs text-orange-500 font-mono">
            {typeof window !== "undefined"
              ? `${window.location.origin}/p/${project.slug}`
              : `/p/${project.slug}`}
          </p>
        </div>
      </div>

      {/* Add URL */}
      <div className="flex items-center gap-3">
        <select
          value={selectedUrlId}
          onChange={(e) => setSelectedUrlId(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all appearance-none"
        >
          <option value="">
            {available.length === 0
              ? "All URLs assigned"
              : "Select a URL to add..."}
          </option>
          {available.map((url) => (
            <option key={url.id} value={url.id}>
              {url.title} — {url.url}
            </option>
          ))}
        </select>
        <button
          onClick={addUrl}
          disabled={!selectedUrlId || adding}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all duration-200 shrink-0"
        >
          {adding ? "Adding..." : "Add URL"}
        </button>
      </div>

      {/* Assigned URLs Table */}
      {assigned.length === 0 ? (
        <div className="text-center py-12 text-stone-500">
          <svg
            className="w-10 h-10 mx-auto mb-3 text-stone-500/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.928-2.006a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374"
            />
          </svg>
          <p className="text-sm">
            No URLs assigned yet. Add URLs above to get started.
          </p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Title
                </th>
                <th className="text-left py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  URL
                </th>
                <th className="text-center py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Shares
                </th>
                <th className="text-right py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {assigned.map((url) => (
                <tr
                  key={url.id}
                  className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors"
                >
                  <td className="py-3.5 px-5 text-stone-50 font-medium">
                    {url.title}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="text-stone-400 font-mono text-xs max-w-xs block truncate">
                      {url.url}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="text-stone-400 font-mono text-xs bg-stone-800 px-2 py-0.5 rounded-md">
                      {url.shares}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => removeUrl(url.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
