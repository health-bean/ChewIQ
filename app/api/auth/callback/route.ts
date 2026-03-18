import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Validate redirect path to prevent open redirects.
 * Only allows relative paths starting with / that don't contain protocol schemes.
 */
function sanitizeRedirectPath(path: string): string {
  const fallback = "/chat";
  if (!path || typeof path !== "string") return fallback;
  // Must start with exactly one / and not contain protocol-like patterns
  if (!/^\/[^/]/.test(path) && path !== "/") return fallback;
  // Block javascript:, data:, or any scheme
  if (/^[a-z]+:/i.test(path.replace(/^\/+/, ""))) return fallback;
  return path;
}

/**
 * Auth callback handler — exchanges an auth code for a session.
 * Used by Supabase email links (password reset, email confirmation, magic links).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeRedirectPath(searchParams.get("next") ?? "/chat");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If code exchange fails, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
