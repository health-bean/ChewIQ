import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cache } from "react";

export interface SessionData {
  userId: string;
  email: string;
  firstName: string;
  isAdmin: boolean;
}

const emptySession: SessionData = {
  userId: "",
  email: "",
  firstName: "",
  isAdmin: false,
};

/**
 * Get the current authenticated user from Supabase Auth + profiles table.
 * Uses React's cache() to deduplicate within a single request —
 * multiple calls in the same request only hit the DB once.
 */
export const getSessionFromCookies = cache(
  async (): Promise<SessionData> => {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return emptySession;

    const [profile] = await db
      .select({
        firstName: profiles.firstName,
        isAdmin: profiles.isAdmin,
      })
      .from(profiles)
      .where(eq(profiles.id, user.id))
      .limit(1);

    return {
      userId: user.id,
      email: user.email ?? "",
      firstName: profile?.firstName ?? user.user_metadata?.firstName ?? "",
      isAdmin: profile?.isAdmin ?? false,
    };
  }
);
