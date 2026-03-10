import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Dashboard from "@/components/admin/Dashboard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminProjectStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
  });

  if (!project) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
          <Link
            href="/admin/projects"
            className="hover:text-orange-500 transition-colors"
          >
            Projects
          </Link>
          <svg
            className="w-3.5 h-3.5"
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
          <span className="text-stone-300">{project.name}</span>
          <svg
            className="w-3.5 h-3.5"
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
          <span className="text-stone-300">Stats</span>
        </div>
        <h1 className="text-3xl font-bold text-stone-50 tracking-tight">
          {project.name} — Stats
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Analytics for this project&apos;s URLs
        </p>
      </div>
      <Dashboard projectId={project.id} />
    </div>
  );
}
