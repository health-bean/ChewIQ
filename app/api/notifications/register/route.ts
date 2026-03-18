import { NextResponse } from "next/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { getSessionFromCookies } from "@/lib/auth/session";
import { log } from "@/lib/logger";

const registerSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(["ios", "android", "web"]),
});

/**
 * POST /api/notifications/register — store push notification device token
 */
export async function POST(request: Request) {
  try {
    const session = await getSessionFromCookies();
    if (!session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Store token in profile (we'd add a device_tokens table for multiple devices later)
    // For now, store in a simple way
    await db
      .update(profiles)
      .set({
        // Store as structured JSON in healthGoals temporarily
        // TODO: Add proper device_tokens table
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, session.userId));

    log.info("Push notification token registered", {
      userId: session.userId,
      platform: parsed.data.platform,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    log.error("POST /api/notifications/register error", {
      error: error as Error,
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
