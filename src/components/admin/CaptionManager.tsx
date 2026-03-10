"use client";

import { useEffect, useState } from "react";

interface CaptionItem {
  id: number;
  text: string;
  usedBySessionId: string | null;
  usedAt: string | null;
  createdAt: string;
}

interface UrlInfo {
  id: number;
  title: string;
  url: string;
}

interface Stats {
  total: number;
  available: number;
  used: number;
}

export default function CaptionManager({ urlId }: { urlId: number }) {
  const [url, setUrl] = useState<UrlInfo | null>(null);
  const [captions, setCaptions] = useState<CaptionItem[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, available: 0, used: 0 });
  const [loading, setLoading] = useState(true);

  // Single add
  const [singleCaption, setSingleCaption] = useState("");
  const [addingSingle, setAddingSingle] = useState(false);

  // Bulk add
  const [showBulk, setShowBulk] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [addingBulk, setAddingBulk] = useState(false);

  async function fetchCaptions() {
    const res = await fetch(`/api/admin/urls/${urlId}/captions`);
    const data = await res.json();
    setUrl(data.url);
    setCaptions(data.captions);
    setStats(data.stats);
    setLoading(false);
  }

  useEffect(() => {
    fetchCaptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addSingle() {
    if (!singleCaption.trim()) return;
    setAddingSingle(true);
    try {
      await fetch(`/api/admin/urls/${urlId}/captions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captions: [singleCaption.trim()] }),
      });
      setSingleCaption("");
      await fetchCaptions();
    } catch {
      // ignore
    } finally {
      setAddingSingle(false);
    }
  }

  async function addBulk() {
    const lines = bulkText
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    if (lines.length === 0) return;
    setAddingBulk(true);
    try {
      await fetch(`/api/admin/urls/${urlId}/captions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ captions: lines }),
      });
      setBulkText("");
      setShowBulk(false);
      await fetchCaptions();
    } catch {
      // ignore
    } finally {
      setAddingBulk(false);
    }
  }

  async function deleteCaption(captionId: number) {
    await fetch(`/api/admin/urls/${urlId}/captions`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ captionId }),
    });
    await fetchCaptions();
  }

  const bulkLineCount = bulkText
    .split("\n")
    .filter((l) => l.trim().length > 0).length;

  if (loading) {
    return (
      <div className="space-y-4 stagger-children">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl h-20 shimmer" />
        <div className="bg-stone-900 border border-stone-800 rounded-2xl h-16 shimmer" />
        <div className="bg-stone-900 border border-stone-800 rounded-2xl h-64 shimmer" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* URL Info Card */}
      {url && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-5">
          <h3 className="text-lg font-semibold text-stone-50">{url.title}</h3>
          <p className="text-sm text-stone-400 font-mono mt-1 truncate">
            {url.url}
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex gap-3">
        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-stone-50 font-mono">
            {stats.total}
          </p>
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.15em] mt-0.5">
            Total
          </p>
        </div>
        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-green-400 font-mono">
            {stats.available}
          </p>
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.15em] mt-0.5">
            Available
          </p>
        </div>
        <div className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-3 text-center">
          <p className="text-2xl font-bold text-amber-400 font-mono">
            {stats.used}
          </p>
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.15em] mt-0.5">
            Used
          </p>
        </div>
      </div>

      {/* Single Add */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Type a caption..."
          value={singleCaption}
          onChange={(e) => setSingleCaption(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addSingle();
          }}
          className="flex-1 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-stone-50 text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
        />
        <button
          onClick={addSingle}
          disabled={!singleCaption.trim() || addingSingle}
          className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all duration-200 shrink-0"
        >
          {addingSingle ? "Adding..." : "Add"}
        </button>
      </div>

      {/* Bulk Add Toggle */}
      <div>
        <button
          onClick={() => setShowBulk(!showBulk)}
          className="inline-flex items-center gap-2 text-sm text-orange-500 hover:text-orange-400 font-medium transition-colors"
        >
          <svg
            className={`w-4 h-4 transition-transform duration-200 ${showBulk ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
          Bulk Add Captions
        </button>

        {showBulk && (
          <div className="mt-3 space-y-3 animate-fade-up">
            <textarea
              placeholder="Paste captions here, one per line..."
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={8}
              className="w-full px-4 py-3 bg-stone-900 border border-stone-800 rounded-xl text-stone-50 text-sm placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all resize-y font-mono leading-relaxed"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-500">
                {bulkLineCount > 0
                  ? `${bulkLineCount} caption${bulkLineCount !== 1 ? "s" : ""} detected`
                  : "One caption per line"}
              </p>
              <button
                onClick={addBulk}
                disabled={bulkLineCount === 0 || addingBulk}
                className="px-4 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all duration-200"
              >
                {addingBulk
                  ? "Adding..."
                  : `Add ${bulkLineCount} Caption${bulkLineCount !== 1 ? "s" : ""}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Captions Table */}
      {captions.length === 0 ? (
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
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
            />
          </svg>
          <p className="text-sm">
            No captions yet. Add captions above to get started.
          </p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Caption
                </th>
                <th className="text-center py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="text-right py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {captions.map((caption) => (
                <tr
                  key={caption.id}
                  className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors"
                >
                  <td className="py-3.5 px-5 text-stone-50 max-w-md">
                    <p className="truncate">{caption.text}</p>
                    {caption.usedBySessionId && (
                      <p className="text-[10px] text-stone-500 font-mono mt-0.5 truncate">
                        {caption.usedBySessionId.slice(0, 8)}...
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full ${
                        caption.usedBySessionId
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          caption.usedBySessionId
                            ? "bg-amber-400"
                            : "bg-green-400"
                        }`}
                      />
                      {caption.usedBySessionId ? "Used" : "Available"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => deleteCaption(caption.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
                    >
                      Delete
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
