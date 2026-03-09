import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  const urls = await prisma.url.findMany({
    include: { _count: { select: { shares: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(urls);
}

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if ("error" in auth) return auth.error;

  try {
    const { url, title, description } = await request.json();

    if (!url || !title) {
      return NextResponse.json(
        { error: "URL and title are required" },
        { status: 400 }
      );
    }

    const newUrl = await prisma.url.create({
      data: { url, title, description: description || null },
    });

    return NextResponse.json(newUrl, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
