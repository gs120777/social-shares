"use client";

import { useState } from "react";
import Link from "next/link";

interface ProjectWithCount {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  isActive: boolean;
  createdAt: string | Date;
  _count: { projectUrls: number };
}

export default function ProjectManager({
  initialProjects,
}: {
  initialProjects: ProjectWithCount[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function resetForm() {
    setFormData({ name: "", slug: "", description: "" });
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const newProject = await res.json();
      if (res.ok) {
        setProjects([
          { ...newProject, _count: newProject._count || { projectUrls: 0 } },
          ...projects,
        ]);
        resetForm();
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(project: ProjectWithCount) {
    const res = await fetch(`/api/admin/projects/${project.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !project.isActive }),
    });
    const updated = await res.json();
    setProjects(
      projects.map((p) => (p.id === project.id ? { ...p, ...updated } : p))
    );
  }

  async function deleteProject(project: ProjectWithCount) {
    if (
      !confirm(
        `Delete project "${project.name}"? This will remove URL assignments but not the URLs themselves.`
      )
    )
      return;

    await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    setProjects(projects.filter((p) => p.id !== project.id));
  }

  function copyProjectLink(slug: string) {
    const url = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
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
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          {showForm ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          )}
        </svg>
        {showForm ? "Cancel" : "New Project"}
      </button>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-4 animate-fade-up"
        >
          <h3 className="text-sm font-semibold text-stone-50 tracking-tight">
            Create New Project
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-1.5">
                Project Name
              </label>
              <input
                type="text"
                placeholder="My Campaign"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name,
                    slug: generateSlug(name),
                  });
                }}
                required
                className="w-full px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-50 placeholder-stone-600 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-1.5">
                Slug
              </label>
              <div className="flex items-center gap-2">
                <span className="text-stone-500 text-sm">/p/</span>
                <input
                  type="text"
                  placeholder="my-campaign"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                  pattern="^[a-z0-9-]+$"
                  className="flex-1 px-4 py-2.5 bg-stone-950 border border-stone-800 rounded-xl text-stone-50 placeholder-stone-600 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/30 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-400 uppercase tracking-[0.15em] mb-1.5">
                Description (optional)
              </label>
              <input
                type="text"
                placeholder="Brief description for workers"
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
              {loading ? "Creating..." : "Create Project"}
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

      {projects.length === 0 ? (
        <div className="text-center py-16 text-stone-500">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-stone-500/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
            />
          </svg>
          <p className="text-sm">
            No projects yet. Create your first project above.
          </p>
        </div>
      ) : (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800">
                <th className="text-left py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Project
                </th>
                <th className="text-left py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Slug
                </th>
                <th className="text-center py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  URLs
                </th>
                <th className="text-center py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Status
                </th>
                <th className="text-right py-3.5 px-5 text-xs text-stone-400 font-medium uppercase tracking-[0.15em]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className="border-b border-stone-800/50 hover:bg-stone-800/30 transition-colors"
                >
                  <td className="py-3.5 px-5">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-stone-50 font-medium hover:text-orange-500 transition-colors"
                    >
                      {project.name}
                    </Link>
                    {project.description && (
                      <p className="text-xs text-stone-500 mt-0.5 truncate max-w-xs">
                        {project.description}
                      </p>
                    )}
                  </td>
                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => copyProjectLink(project.slug)}
                      className="inline-flex items-center gap-1.5 text-stone-400 hover:text-orange-500 font-mono text-xs transition-colors"
                      title="Click to copy worker link"
                    >
                      /p/{project.slug}
                      {copiedSlug === project.slug ? (
                        <svg
                          className="w-3.5 h-3.5 text-green-400"
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
                      ) : (
                        <svg
                          className="w-3.5 h-3.5 opacity-50"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                          />
                        </svg>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span className="text-stone-400 font-mono text-xs bg-stone-800 px-2 py-0.5 rounded-md">
                      {project._count.projectUrls}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full ${
                        project.isActive
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-stone-800 text-stone-500 border border-stone-800"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${project.isActive ? "bg-green-400" : "bg-stone-500"}`}
                      />
                      {project.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right space-x-3">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="text-xs text-orange-500 hover:text-orange-400 font-medium transition-colors"
                    >
                      Manage
                    </Link>
                    <Link
                      href={`/admin/projects/${project.id}/stats`}
                      className="text-xs text-stone-400 hover:text-stone-300 font-medium transition-colors"
                    >
                      Stats
                    </Link>
                    <button
                      onClick={() => toggleActive(project)}
                      className="text-xs text-yellow-500 hover:text-yellow-400 font-medium transition-colors"
                    >
                      {project.isActive ? "Disable" : "Enable"}
                    </button>
                    <button
                      onClick={() => deleteProject(project)}
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
