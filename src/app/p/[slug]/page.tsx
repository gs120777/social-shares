import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ShareCard from "@/components/worker/ShareCard";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const project = await prisma.project.findUnique({
    where: { slug, isActive: true },
    include: {
      projectUrls: {
        include: {
          url: {
            select: { id: true, url: true, title: true, description: true, isActive: true },
          },
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  const activeUrls = project.projectUrls
    .map((pu) => pu.url)
    .filter((u) => u.isActive);

  if (activeUrls.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.06)_0%,transparent_60%)]" />
        <div className="text-center relative z-10 animate-fade-up">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-orange-500/10 flex items-center justify-center">
            <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.928-2.006a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L4.34 8.374" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-50 mb-3 tracking-tight">
            No URLs Available
          </h1>
          <p className="text-stone-400 max-w-xs mx-auto leading-relaxed">
            This project doesn&apos;t have any active URLs yet. Check back later.
          </p>
        </div>
      </div>
    );
  }

  // Pick a random URL
  const randomIndex = Math.floor(Math.random() * activeUrls.length);
  const url = activeUrls[randomIndex];

  // Fetch an unclaimed caption for this URL
  const caption = await prisma.caption.findFirst({
    where: { urlId: url.id, usedBySessionId: null },
    select: { id: true, text: true },
  });

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 sm:justify-center relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(249,115,22,0.07)_0%,transparent_50%)]" />

      <div className="text-center mb-10 relative z-10 animate-fade-up">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-stone-800 bg-stone-900/50 text-xs text-stone-400 uppercase tracking-widest mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
          Live
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-50 tracking-tight">
          {project.name}
        </h1>
        {project.description && (
          <p className="text-stone-300 mt-3 text-lg max-w-md mx-auto">
            {project.description}
          </p>
        )}
        {!project.description && (
          <p className="text-stone-300 mt-3 text-lg">
            Share the URL below on your social media
          </p>
        )}
      </div>

      <ShareCard initialUrl={{ ...url, caption: caption || null }} projectSlug={slug} />
    </div>
  );
}
