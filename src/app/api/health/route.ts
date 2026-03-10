import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test 1: Basic response (no DB)
    const basicCheck = { status: "ok", timestamp: new Date().toISOString() };

    // Test 2: Try DB connection
    try {
      const count = await prisma.url.count();
      return NextResponse.json({ ...basicCheck, db: "connected", urlCount: count });
    } catch (dbError: unknown) {
      const message = dbError instanceof Error ? dbError.message : String(dbError);
      return NextResponse.json({ ...basicCheck, db: "error", dbError: message }, { status: 500 });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ status: "error", error: message }, { status: 500 });
  }
}
