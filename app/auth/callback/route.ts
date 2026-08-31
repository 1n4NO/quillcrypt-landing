import { NextResponse } from "next/server";
import { SupabaseConfigurationError } from "../../lib/supabase/config";
import { createServerSupabaseClient } from "../../lib/supabase/server";
import { safeReturnPath } from "../../lib/safe-return-path";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeReturnPath(requestUrl.searchParams.get("next"));

  if (!code) {
    return NextResponse.redirect(new URL("/sign-in?error=invalid-callback", requestUrl.origin));
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL("/sign-in?error=invalid-callback", requestUrl.origin));
    }
  } catch (error) {
    const errorCode = error instanceof SupabaseConfigurationError ? "configuration" : "invalid-callback";
    return NextResponse.redirect(new URL(`/sign-in?error=${errorCode}`, requestUrl.origin));
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
