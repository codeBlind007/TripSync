"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

export default function GoogleLoginPage() {
  const { fetchStatus, signIn } = useSignIn();
  const startGoogleLoginStarted = useRef(false);
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const redirectUrl = searchParams.get("redirect_url");
  const invite = searchParams.get("invite");

  const redirectUrlComplete = useMemo(() => {
    if (redirectUrl) return redirectUrl;
    return invite ? `/dashboard?invite=${invite}` : "/dashboard";
  }, [invite, redirectUrl]);

  useEffect(() => {
    const startGoogleLogin = async () => {
      if (fetchStatus !== "idle" || !signIn) return;
      // Prevent duplicate calls if effect runs multiple times
      if (startGoogleLoginStarted.current) return;
      startGoogleLoginStarted.current = true;

      try {
        await signIn.sso({
          strategy: "oauth_google",
          redirectUrl: redirectUrlComplete,
          redirectCallbackUrl: "/login/google/callback",
        });
      } catch (err) {
        console.error("Google login redirect failed:", err);
        setError("Could not start Google login. Please try again.");
      }
    };

    startGoogleLogin();
  }, [fetchStatus, redirectUrlComplete, signIn]);

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Continue with Google</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to Clerk to complete sign in.
        </p>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
