import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UrlManager from "@/components/admin/UrlManager";

export const dynamic = "force-dynamic";

export default async function AdminUrlsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const urls = await prisma.url.findMany({
    include: { _count: { select: { shares: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage URLs</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Add, edit, and manage URLs for workers to share
          </p>
        </div>
      </div>
      <UrlManager initialUrls={urls} />
    </div>
  );
}
