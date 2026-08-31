import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabasePublicConfig } from "./app/lib/supabase/config";
import { safeReturnPath } from "./app/lib/safe-return-path";

export async function proxy(request: NextRequest) {
  const config = getSupabasePublicConfig();
  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");
  const mockDashboard = process.env.NODE_ENV !== "production" && process.env.DASHBOARD_MOCK_MODE === "true";

  if (isDashboard && mockDashboard) {
    const response = NextResponse.next();
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }

  if (!config) {
    if (isDashboard) {
      return NextResponse.redirect(new URL("/sign-in?error=configuration", request.url));
    }
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });
  let refreshedCookies: Array<{
    name: string;
    value: string;
    options: Parameters<typeof response.cookies.set>[2];
  }> = [];
  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        refreshedCookies = cookiesToSet;
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims?.sub);

  const redirectWithRefreshedCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    for (const { name, value, options } of refreshedCookies) {
      redirectResponse.cookies.set(name, value, options);
    }
    redirectResponse.headers.set("Cache-Control", "private, no-store");
    return redirectResponse;
  };

  if (isDashboard && !signedIn) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    return redirectWithRefreshedCookies(signInUrl);
  }

  if (request.nextUrl.pathname === "/sign-in" && signedIn) {
    return redirectWithRefreshedCookies(new URL(safeReturnPath(request.nextUrl.searchParams.get("next")), request.url));
  }

  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/invite", "/auth/callback"],
};
