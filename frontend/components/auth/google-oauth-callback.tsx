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
  const { isLoaded } = useAuth();
  const clerk = useClerk();
  const router = useRouter();
  const syncStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || syncStarted.current) {
      return;
    }

    syncStarted.current = true;

    const syncUser = async () => {
      try {
        let redirectTarget = "/dashboard";

        await clerk.handleRedirectCallback({}, async (to) => {
          redirectTarget = to || "/dashboard";
        });

        const token = await clerk.session?.getToken();
        const res = await fetch(buildClientApiUrl("/api/auth/oauth-callback"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error("Failed to sync Google account");
        }

        router.push(redirectTarget);
      } catch (err) {
        console.error("Google account sync failed:", err);
        setError("Google sign-in completed, but account sync failed. Please refresh or try logging in again.");
      }
    };

    void syncUser();
  }, [isLoaded, clerk, router]);

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
