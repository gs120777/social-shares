import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { buildShareUrl, PLATFORMS, type Platform } from "@/lib/constants";

export async function POST(request: Request) {
  try {
    const { urlId, platform, sessionId, captionId } = await request.json();

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

    // If a captionId was provided, claim it atomically
    let captionText: string | null = null;
    if (captionId) {
      // Only claim if it's still unclaimed (race-condition safe)
      const result = await prisma.caption.updateMany({
        where: { id: captionId, urlId, usedBySessionId: null },
        data: { usedBySessionId: sessionId, usedAt: new Date() },
      });

      // If we successfully claimed it, fetch its text
      if (result.count > 0) {
        const claimed = await prisma.caption.findUnique({
          where: { id: captionId },
          select: { text: true },
        });
        captionText = claimed?.text ?? null;
      }
    }

    const shareUrl = buildShareUrl(
      platform as Platform,
      url.url,
      url.title,
      url.description,
      captionText
    );

    return NextResponse.json({ shareUrl });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
