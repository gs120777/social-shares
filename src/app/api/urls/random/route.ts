import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const excludeId = searchParams.get("exclude");

    const where = {
      isActive: true,
      ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
    };

    const count = await prisma.url.count({ where });

    if (count === 0) {
      // If excluding caused zero results, try without excluding
      const totalCount = await prisma.url.count({ where: { isActive: true } });
      if (totalCount === 0) {
        return NextResponse.json({ error: "No URLs available" }, { status: 404 });
      }
      const skip = Math.floor(Math.random() * totalCount);
      const url = await prisma.url.findFirst({
        where: { isActive: true },
        skip,
        select: { id: true, url: true, title: true, description: true },
      });
      return NextResponse.json(url);
    }

    const skip = Math.floor(Math.random() * count);
    const url = await prisma.url.findFirst({
      where,
      skip,
      select: { id: true, url: true, title: true, description: true },
    });

    return NextResponse.json(url);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
