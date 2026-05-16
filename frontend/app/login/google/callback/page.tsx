"use client";

import { GoogleOAuthCallback } from "@/components/auth/google-oauth-callback";

export default function GoogleLoginCallbackPage() {
  return (
    <GoogleOAuthCallback
      title="Completing sign in"
      description="Finishing authentication and returning to TripSync."
    />
  );
}
