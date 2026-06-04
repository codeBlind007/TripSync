"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export function GoogleOAuthCallback() {
  return (
    <AuthenticateWithRedirectCallback
      signInForceRedirectUrl="/dashboard"
      signUpForceRedirectUrl="/dashboard"
    />
  );
}
