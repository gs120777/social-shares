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
    include: { _count: { select: { shares: true, captions: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-stone-50 tracking-tight">
          Manage URLs
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Add, edit, and manage URLs for workers to share
        </p>
      </div>
      <UrlManager initialUrls={urls} />
    </div>
  );
}
