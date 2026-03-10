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

  const projectUrls = await prisma.projectUrl.findMany({
    where: { projectId },
    include: {
      url: {
        include: { _count: { select: { shares: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Also get URLs NOT in this project for the "add" dropdown
  const assignedUrlIds = projectUrls.map((pu) => pu.url.id);
  const availableUrls = await prisma.url.findMany({
    where: {
      isActive: true,
      id: { notIn: assignedUrlIds.length > 0 ? assignedUrlIds : [-1] },
    },
    orderBy: { title: "asc" },
  });

  return NextResponse.json({
    assigned: projectUrls.map((pu) => ({
      projectUrlId: pu.id,
      id: pu.url.id,
      title: pu.url.title,
      url: pu.url.url,
      description: pu.url.description,
      shares: pu.url._count.shares,
    })),
    available: availableUrls.map((u) => ({
      id: u.id,
      title: u.title,
      url: u.url,
    })),
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const projectId = Number(id);
    const { urlId } = await request.json();

    if (!urlId) {
      return NextResponse.json(
        { error: "urlId is required" },
        { status: 400 }
      );
    }

    const projectUrl = await prisma.projectUrl.create({
      data: { projectId, urlId },
    });

    return NextResponse.json(projectUrl, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "URL may already be assigned to this project" },
      { status: 409 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { id } = await params;
    const projectId = Number(id);
    const { urlId } = await request.json();

    await prisma.projectUrl.deleteMany({
      where: { projectId, urlId },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
