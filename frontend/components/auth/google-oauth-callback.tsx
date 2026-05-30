"use client";

import { useAuth, useClerk } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { buildClientApiUrl } from "@/lib/client-api";

type GoogleOAuthCallbackProps = {
  title: string;
  description: string;
};

export function GoogleOAuthCallback({
  title,
  description,
}: GoogleOAuthCallbackProps) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const syncStarted = useRef(false);
  const callbackHandled = useRef(false);
  const redirectTarget = useRef<string>("/dashboard");
  const [error, setError] = useState<string | null>(null);

  // 1. Process the OAuth callback URL
  useEffect(() => {
    if (!isLoaded || callbackHandled.current) return;

    callbackHandled.current = true;
    clerk.handleRedirectCallback({}, async (to) => {
      if (to) redirectTarget.current = to;
    }).catch((err) => {
      console.error("Error processing OAuth callback:", err);
      setError("Failed to process Google sign-in callback.");
    });
  }, [isLoaded, clerk]);

  // 2. Sync the user once signed in
  useEffect(() => {
    if (!isLoaded || !isSignedIn || syncStarted.current) {
      return;
    }

    syncStarted.current = true;

    const syncUser = async () => {
      try {
        const token = await getToken();
        const res = await fetch(buildClientApiUrl("/api/auth/oauth-callback"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to sync Google account: ${res.statusText}`);
        }

        router.push(redirectTarget.current);
      } catch (err) {
        console.error("Google account sync failed:", err);
        setError("Google sign-in completed, but account sync failed. Please refresh or try logging in again.");
      }
    };

    void syncUser();
  }, [isLoaded, isSignedIn, getToken, router]);

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
