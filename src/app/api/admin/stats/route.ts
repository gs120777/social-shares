import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const [
    totalShares,
    sharesToday,
    activeUrls,
    sharesByPlatform,
    topUrls,
    uniqueVisitors,
  ] = await Promise.all([
    prisma.share.count(),
    prisma.share.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.url.count({ where: { isActive: true } }),
    prisma.share.groupBy({
      by: ["platform"],
      _count: { id: true },
    }),
    prisma.url.findMany({
      include: { _count: { select: { shares: true } } },
      orderBy: { shares: { _count: "desc" } },
      take: 10,
    }),
    prisma.share
      .findMany({
        distinct: ["sessionId"],
        select: { sessionId: true },
      })
      .then((r) => r.length),
  ]);

  // Timeline: shares per day for last 30 days
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const timelineRaw = (await prisma.$queryRawUnsafe(
    `SELECT DATE(createdAt) as date, COUNT(*) as count FROM Share WHERE createdAt >= ? GROUP BY DATE(createdAt) ORDER BY date ASC`,
    thirtyDaysAgo.toISOString()
  )) as { date: string; count: bigint }[];

  const timeline = timelineRaw.map((row) => ({
    date: row.date,
    count: Number(row.count),
  }));

  // Recent activity
  const recentShares = await prisma.share.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { url: { select: { title: true } } },
  });

  return NextResponse.json({
    totalShares,
    sharesToday,
    activeUrls,
    uniqueVisitors,
    sharesByPlatform: sharesByPlatform.map((s) => ({
      platform: s.platform,
      count: s._count.id,
    })),
    topUrls: topUrls.map((u) => ({
      id: u.id,
      title: u.title,
      url: u.url,
      shares: u._count.shares,
    })),
    timeline,
    recentShares: recentShares.map((s) => ({
      id: s.id,
      platform: s.platform,
      urlTitle: s.url.title,
      sessionId: s.sessionId.slice(0, 8),
      createdAt: s.createdAt,
    })),
  });
}
