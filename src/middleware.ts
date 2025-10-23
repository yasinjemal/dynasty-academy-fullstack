import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import rateLimiter, { RATE_LIMITS, getIdentifier } from "@/lib/security/rate-limiter";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Rate limiting for auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    const identifier = getIdentifier(request);
    const config = pathname.startsWith("/login") ? RATE_LIMITS.LOGIN : RATE_LIMITS.REGISTER;
    const { allowed, remaining, resetTime } = await rateLimiter.checkLimit(
      identifier,
      config.limit,
      config.windowMs
    );

    if (!allowed) {
      return new NextResponse("Too Many Requests - Please try again later", {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((resetTime - Date.now()) / 1000).toString(),
          "Content-Type": "text/plain",
        },
      });
    }
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });
  const isAuth = !!token;
  const isAuthPage =
    request.nextUrl.pathname.startsWith("/login") ||
    request.nextUrl.pathname.startsWith("/register");
  const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
  const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");
  const isSettingsPage = request.nextUrl.pathname.startsWith("/settings");
  const isInstructorPage = request.nextUrl.pathname.startsWith("/instructor");

  // Redirect authenticated users away from auth pages
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Redirect unauthenticated users to login
  if (
    !isAuth &&
    (isDashboardPage || isAdminPage || isSettingsPage || isInstructorPage)
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin role for admin pages
  if (isAdminPage && isAuth) {
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Check instructor role for instructor pages
  if (isInstructorPage && isAuth) {
    const userRole = token.role as string;
    if (userRole !== "INSTRUCTOR" && userRole !== "ADMIN") {
      // Not an instructor - redirect to become instructor page
      return NextResponse.redirect(new URL("/become-instructor", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/instructor/:path*",
    "/login",
    "/register",
  ],
};
