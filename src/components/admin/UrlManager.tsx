"use client";

import { useState } from "react";
import Link from "next/link";

interface UrlWithCount {
  id: number;
  url: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | Date;
  _count: { shares: number; captions: number };
}

export default function UrlManager({
  initialUrls,
}: {
  initialUrls: UrlWithCount[];
}) {
  const [urls, setUrls] = useState(initialUrls);
  const [showForm, setShowForm] = useState(false);
  const [editingUrl, setEditingUrl] = useState<UrlWithCount | null>(null);
  const [formData, setFormData] = useState({
    url: "",
    title: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  function resetForm() {
    setFormData({ url: "", title: "", description: "" });
    setEditingUrl(null);
    setShowForm(false);
  }

  function startEdit(url: UrlWithCount) {
    setEditingUrl(url);
    setFormData({
      url: url.url,
      title: url.title,
      description: url.description || "",
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUrl) {
        const res = await fetch(`/api/admin/urls/${editingUrl.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const updated = await res.json();
        setUrls(
          urls.map((u) =>
            u.id === editingUrl.id ? { ...u, ...updated } : u
          )
        );
      } else {
        const res = await fetch("/api/admin/urls", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const newUrl = await res.json();
        setUrls([{ ...newUrl, _count: { shares: 0, captions: 0 } }, ...urls]);
      }
      resetForm();
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(url: UrlWithCount) {
    const res = await fetch(`/api/admin/urls/${url.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !url.isActive }),
    });
    const updated = await res.json();
    setUrls(urls.map((u) => (u.id === url.id ? { ...u, ...updated } : u)));
  }

  async function deleteUrl(url: UrlWithCount) {
    if (!confirm(`Delete "${url.title}"? This will also delete all share records.`)) return;

    await fetch(`/api/admin/urls/${url.id}`, { method: "DELETE" });
    setUrls(urls.filter((u) => u.id !== url.id));
  }

  return (
    <div>
      <button
        onClick={() => {
          resetForm();
          setShowForm(!showForm);
        }}
        className="mb-5 inline-flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-medium rounded-xl transition-all duration-200 hover:shadow-[0_4px_20px_rgba(249,115,22,0.25)]"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {showForm && !editingUrl ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          )}
        </svg>
        {showForm && !editingUrl ? "Cancel" : "Add URL"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-4 animate-fade-up"
        >
          <h3 className="text-sm font-semibold text-stone-50 tracking-tight">
            {editingUrl ? "Edit URL" : "Add New URL"}
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-1.5">
                Title
              </label>
              <input
                type="text"
                placeholder="My Website"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-50 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-1.5">
                URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={formData.url}
                onChange={(e) =>
                  setFormData({ ...formData, url: e.target.value })
                }
                required
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-50 placeholder-stone-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-1.5">
                Description (optional)
              </label>
              <input
                type="text"
                placeholder="Brief description of this URL"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-50 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-all duration-200"
            >
              {loading
                ? "Saving..."
                : editingUrl
                  ? "Update"
                  : "Add URL"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-400 text-sm rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {urls.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-stone-500/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.928-2.006a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
          </svg>
          <p className="text-sm">No URLs yet. Add your first URL above.</p>
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
                  Status
                </th>
                <th className="text-center py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Shares
                </th>
                <th className="text-center py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Captions
                </th>
                <th className="text-right py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
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
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full ${
                        url.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-stone-800 text-stone-500 border border-stone-800"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${url.isActive ? "bg-green-400" : "bg-stone-500"}`} />
                      {url.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="text-stone-400 font-mono text-xs bg-stone-800 px-2 py-0.5 rounded-md">
                      {url._count.shares}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href={`/admin/urls/${url.id}/captions`}
                      className="text-orange-500 hover:text-orange-400 font-mono text-xs font-medium transition-colors"
                    >
                      {url._count.captions}
                    </Link>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-3">
                    <button
                      onClick={() => startEdit(url)}
                      className="text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(url)}
                      className="text-xs text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                    >
                      {url.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => deleteUrl(url)}
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
