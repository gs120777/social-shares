import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const projectId = Number(id);

  // Get URL IDs in this project
  const projectUrls = await prisma.projectUrl.findMany({
    where: { projectId },
    select: { urlId: true },
  });
  const urlIds = projectUrls.map((pu) => pu.urlId);

  if (urlIds.length === 0) {
    return NextResponse.json({
      totalShares: 0,
      sharesToday: 0,
      activeUrls: 0,
      uniqueVisitors: 0,
      sharesByPlatform: [],
      topUrls: [],
      timeline: [],
      recentShares: [],
    });
  }

  const now = new Date();
  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const [
    totalShares,
    sharesToday,
    sharesByPlatform,
    topUrls,
    uniqueVisitors,
  ] = await Promise.all([
    prisma.share.count({ where: { urlId: { in: urlIds } } }),
    prisma.share.count({
      where: { urlId: { in: urlIds }, createdAt: { gte: todayStart } },
    }),
    prisma.share.groupBy({
      by: ["platform"],
      where: { urlId: { in: urlIds } },
      _count: { id: true },
    }),
    prisma.url.findMany({
      where: { id: { in: urlIds } },
      include: { _count: { select: { shares: true } } },
      orderBy: { shares: { _count: "desc" } },
      take: 10,
    }),
    prisma.share
      .findMany({
        where: { urlId: { in: urlIds } },
        distinct: ["sessionId"],
        select: { sessionId: true },
      })
      .then((r) => r.length),
  ]);

  // Timeline for project URLs
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const urlIdsStr = urlIds.join(",");
  const timelineRaw = (await prisma.$queryRawUnsafe(
    `SELECT DATE(createdAt) as date, COUNT(*) as count FROM Share WHERE urlId IN (${urlIdsStr}) AND createdAt >= ? GROUP BY DATE(createdAt) ORDER BY date ASC`,
    thirtyDaysAgo.toISOString()
  )) as { date: string; count: bigint }[];

  const timeline = timelineRaw.map((row) => ({
    date: row.date,
    count: Number(row.count),
  }));

  const recentShares = await prisma.share.findMany({
    where: { urlId: { in: urlIds } },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { url: { select: { title: true } } },
  });

  return NextResponse.json({
    totalShares,
    sharesToday,
    activeUrls: urlIds.length,
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
