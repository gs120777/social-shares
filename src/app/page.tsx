import { prisma } from "@/lib/prisma";
import ShareCard from "@/components/worker/ShareCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const count = await prisma.url.count({ where: { isActive: true } });

  if (count === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="text-2xl font-bold text-white mb-2">
            No URLs Available
          </h1>
          <p className="text-zinc-400">
            Check back later — new URLs will be added soon.
          </p>
        </div>
      </div>
    );
  }

  const skip = Math.floor(Math.random() * count);
  const url = await prisma.url.findFirst({
    where: { isActive: true },
    skip,
    select: { id: true, url: true, title: true, description: true },
  });

  if (!url) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Social Shares</h1>
        <p className="text-zinc-400">
          Share the URL below on your social media
        </p>
      </div>
      <ShareCard initialUrl={url} />
    </div>
  );
}
