import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/login(.*)",
  "/signup(.*)",
  "/invite(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  const { pathname } = req.nextUrl;

  // Redirect logged-in users away from auth pages
  if (
    userId &&
    (
      pathname.startsWith("/login") ||
      pathname.startsWith("/signup")
    )
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  // Protect private routes
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};