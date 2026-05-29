import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { getSecurityHeaders } from "@/lib/security/headers";

const PUBLIC_API = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api/webhooks/ccbill",
  "/api/webhooks/crypto",
  "/api/analytics/track",
  "/api/platform/settings",
]);
const PUBLIC_PAGES = new Set(["/", "/login", "/register", "/legal/terms", "/legal/privacy"]);

const USER_PAGE =
  /^\/(dashboard|story|player|avatar|wallet|store|upgrade|settings|catalog|notifications|bookmarks)(\/|$)/;

const ADMIN_PAGE = /^\/admin(\/|$)/;

function withSecurityHeaders(response: NextResponse) {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) {
    return NextResponse.next();
  }

  if (PUBLIC_PAGES.has(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname === "/api/media/stream") {
    return withSecurityHeaders(NextResponse.next());
  }

  if (PUBLIC_API.has(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  const token = request.cookies.get(ACCESS_COOKIE)?.value;
  const payload = token ? await verifyAccessToken(token) : null;

  const isApi = pathname.startsWith("/api/");
  const isUserPage = USER_PAGE.test(pathname);
  const isAdminPage = ADMIN_PAGE.test(pathname);

  if (isAdminPage) {
    if (!payload?.sub || payload.accountType !== "ADMIN") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
    );
  }

  if (isApi && pathname.startsWith("/api/admin")) {
    if (!payload?.sub || payload.accountType !== "ADMIN") {
      return withSecurityHeaders(
        NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      );
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
    );
  }

  if (isApi && !PUBLIC_API.has(pathname)) {
    if (!payload?.sub) {
      return withSecurityHeaders(
        NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      );
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
    );
  }

  if (isUserPage) {
    if (!payload?.sub) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return withSecurityHeaders(NextResponse.redirect(loginUrl));
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.sub);
    return withSecurityHeaders(
      NextResponse.next({ request: { headers: requestHeaders } }),
    );
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
