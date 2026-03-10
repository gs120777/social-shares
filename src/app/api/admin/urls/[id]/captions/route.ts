import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const urlId = Number(id);

  const url = await prisma.url.findUnique({
    where: { id: urlId },
    select: { id: true, title: true, url: true },
  });

  if (!url) {
    return NextResponse.json({ error: "URL not found" }, { status: 404 });
  }

  const captions = await prisma.caption.findMany({
    where: { urlId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      text: true,
      usedBySessionId: true,
      usedAt: true,
      createdAt: true,
    },
  });

  const total = captions.length;
  const used = captions.filter((c) => c.usedBySessionId !== null).length;
  const available = total - used;

  return NextResponse.json({
    url,
    captions,
    stats: { total, available, used },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const urlId = Number(id);

  const url = await prisma.url.findUnique({ where: { id: urlId } });
  if (!url) {
    return NextResponse.json({ error: "URL not found" }, { status: 404 });
  }

  const { captions } = await request.json();

  if (!Array.isArray(captions) || captions.length === 0) {
    return NextResponse.json(
      { error: "Provide an array of caption strings" },
      { status: 400 }
    );
  }

  // Filter empty lines and trim
  const cleaned = captions
    .map((c: string) => (typeof c === "string" ? c.trim() : ""))
    .filter((c: string) => c.length > 0);

  if (cleaned.length === 0) {
    return NextResponse.json(
      { error: "No valid captions provided" },
      { status: 400 }
    );
  }

  const result = await prisma.caption.createMany({
    data: cleaned.map((text: string) => ({ urlId, text })),
  });

  return NextResponse.json({ created: result.count });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const { id } = await params;
  const urlId = Number(id);
  const { captionId } = await request.json();

  if (!captionId) {
    return NextResponse.json(
      { error: "captionId is required" },
      { status: 400 }
    );
  }

  await prisma.caption.deleteMany({
    where: { id: captionId, urlId },
  });

  return NextResponse.json({ success: true });
}
