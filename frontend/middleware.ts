import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const publicPrefixes = ["/invite"];

  const isPublic =
    ["/", "/login", "/signup"].includes(pathname) ||
    publicPrefixes.some((route) => pathname.startsWith(route));

  // If logged in user tries to access login/signup
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect all other routes
  if (!token && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
