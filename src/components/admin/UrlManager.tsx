"use client";

import { useState } from "react";

interface UrlWithCount {
  id: number;
  url: string;
  title: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | Date;
  _count: { shares: number };
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
        setUrls([{ ...newUrl, _count: { shares: 0 } }, ...urls]);
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
        className="mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {showForm && !editingUrl ? "Cancel" : "Add URL"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-3"
        >
          <h3 className="text-sm font-medium text-white">
            {editingUrl ? "Edit URL" : "Add New URL"}
          </h3>
          <input
            type="text"
            placeholder="Title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="https://example.com"
            value={formData.url}
            onChange={(e) =>
              setFormData({ ...formData, url: e.target.value })
            }
            required
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
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
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {urls.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <p>No URLs yet. Add your first URL above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left py-3 px-3 text-zinc-400 font-medium">
                  Title
                </th>
                <th className="text-left py-3 px-3 text-zinc-400 font-medium">
                  URL
                </th>
                <th className="text-center py-3 px-3 text-zinc-400 font-medium">
                  Status
                </th>
                <th className="text-center py-3 px-3 text-zinc-400 font-medium">
                  Shares
                </th>
                <th className="text-right py-3 px-3 text-zinc-400 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {urls.map((url) => (
                <tr
                  key={url.id}
                  className="border-b border-zinc-800/50 hover:bg-zinc-900/50"
                >
                  <td className="py-3 px-3 text-white">{url.title}</td>
                  <td className="py-3 px-3">
                    <span className="text-zinc-400 font-mono text-xs max-w-xs block truncate">
                      {url.url}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                        url.isActive
                          ? "bg-green-500/10 text-green-400"
                          : "bg-zinc-500/10 text-zinc-500"
                      }`}
                    >
                      {url.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center text-zinc-300">
                    {url._count.shares}
                  </td>
                  <td className="py-3 px-3 text-right space-x-2">
                    <button
                      onClick={() => startEdit(url)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => toggleActive(url)}
                      className="text-xs text-yellow-400 hover:text-yellow-300"
                    >
                      {url.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => deleteUrl(url)}
                      className="text-xs text-red-400 hover:text-red-300"
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
