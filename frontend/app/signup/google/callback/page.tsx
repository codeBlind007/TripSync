"use client";

import { GoogleOAuthCallback } from "@/components/auth/google-oauth-callback";

export default function GoogleSignupCallbackPage() {
  return (
    <GoogleOAuthCallback
      title="Completing sign up"
      description="Finishing authentication and creating your TripSync account."
    />
  );
}
