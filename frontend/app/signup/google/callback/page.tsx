"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function GoogleSignupCallbackPage() {
  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Completing sign up</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Finishing authentication and creating your TripSync account.
        </p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
