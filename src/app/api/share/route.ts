import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildShareUrl, PLATFORMS, type Platform } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { urlId, platform, sessionId } = await request.json();

    if (!urlId || !platform || !sessionId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!PLATFORMS.includes(platform as Platform)) {
      return NextResponse.json(
        { error: "Invalid platform" },
        { status: 400 }
      );
    }

    const url = await prisma.url.findFirst({
      where: { id: urlId, isActive: true },
    });

    if (!url) {
      return NextResponse.json({ error: "URL not found" }, { status: 404 });
    }

    await prisma.share.create({
      data: {
        urlId,
        platform,
        sessionId,
        ipAddress: request.headers.get("x-forwarded-for") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    const shareUrl = buildShareUrl(platform as Platform, url.url, url.title);

    return NextResponse.json({ shareUrl });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
