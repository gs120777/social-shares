import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("exclude");

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
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Filter to active URLs only
    let activeUrls = project.projectUrls
      .map((pu) => pu.url)
      .filter((u) => u.isActive);

    if (activeUrls.length === 0) {
      return NextResponse.json(
        { error: "No URLs available in this project" },
        { status: 404 }
      );
    }

    // Try excluding the current URL
    if (excludeId) {
      const filtered = activeUrls.filter((u) => u.id !== Number(excludeId));
      if (filtered.length > 0) {
        activeUrls = filtered;
      }
    }

    // Pick random
    const randomIndex = Math.floor(Math.random() * activeUrls.length);
    const url = activeUrls[randomIndex];

    // Fetch an unclaimed caption for this URL
    const caption = await prisma.caption.findFirst({
      where: { urlId: url.id, usedBySessionId: null },
      select: { id: true, text: true },
    });

    return NextResponse.json({
      id: url.id,
      url: url.url,
      title: url.title,
      description: url.description,
      caption: caption || null,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
