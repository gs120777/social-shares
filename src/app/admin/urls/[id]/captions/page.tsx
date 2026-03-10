import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CaptionManager from "@/components/admin/CaptionManager";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminCaptionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const url = await prisma.url.findUnique({
    where: { id: Number(id) },
    select: { id: true, title: true, url: true },
  });

  if (!url) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-stone-500 mb-2">
          <Link
            href="/admin/urls"
            className="hover:text-orange-500 transition-colors"
          >
            Manage URLs
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
          <span className="text-stone-300">{url.title}</span>
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
          <span className="text-stone-300">Captions</span>
        </div>
        <h1 className="text-3xl font-bold text-stone-50 tracking-tight">
          {url.title} — Captions
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Manage unique captions workers will use when sharing this URL
        </p>
      </div>
      <CaptionManager urlId={url.id} />
    </div>
  );
}
