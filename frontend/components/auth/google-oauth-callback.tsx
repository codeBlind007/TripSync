"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export function GoogleOAuthCallback() {
  // Do not force /dashboard — preserves redirect_url from the OAuth start (e.g. /join/:code).
  return <AuthenticateWithRedirectCallback />;
}
