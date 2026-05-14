"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function GoogleLoginCallbackPage() {
  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Completing sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Finishing authentication and returning to TripSync.
        </p>
        <AuthenticateWithRedirectCallback />
      </div>
    </div>
  );
}
