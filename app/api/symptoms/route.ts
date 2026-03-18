import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { symptomsDatabase } from "@/lib/db/schema";
import { getSessionFromCookies } from "@/lib/auth/session";
import { log } from "@/lib/logger";

// ── GET /api/symptoms ────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getSessionFromCookies();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const symptoms = await db
      .select({
        id: symptomsDatabase.id,
        name: symptomsDatabase.name,
        category: symptomsDatabase.category,
        isCommon: symptomsDatabase.isCommon,
      })
      .from(symptomsDatabase);

    return NextResponse.json({ symptoms });
  } catch (error) {
    log.error("GET /api/symptoms error", { error: error as Error });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
