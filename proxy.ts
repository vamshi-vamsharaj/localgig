import { type NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PROTECTED_PREFIXES = ["/dashboard"] as const;
const AUTH_ROUTES = ["/sign-in", "/sign-up"] as const;
const AUTH_API_PREFIX = "/api/auth";

function isProtected(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
}

function isAuthApi(pathname: string): boolean {
  return pathname.startsWith(AUTH_API_PREFIX);
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAuthApi(pathname)) {
    return NextResponse.next();
  }

  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = !!sessionCookie;

  if (isProtected(pathname) && !isAuthenticated) {
    const signInUrl = new URL("/sign-in", request.url);

    signInUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(signInUrl);
  }

  if (isAuthRoute(pathname) && isAuthenticated) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot|otf|css|js|map)$).*)",
  ],
};