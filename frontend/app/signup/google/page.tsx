"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSignUp } from "@clerk/nextjs";

export default function GoogleSignupPage() {
  const { fetchStatus, signUp } = useSignUp();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const redirectUrl = searchParams.get("redirect_url");
  const invite = searchParams.get("invite");

  const redirectUrlComplete = useMemo(() => {
    if (redirectUrl) return redirectUrl;
    return invite ? `/dashboard?invite=${invite}` : "/dashboard";
  }, [invite, redirectUrl]);

  useEffect(() => {
    const startGoogleSignup = async () => {
      if (fetchStatus !== "idle" || !signUp) return;

      try {
        await signUp.sso({
          strategy: "oauth_google",
          redirectUrl: redirectUrlComplete,
          redirectCallbackUrl: "/signup/google/callback",
        });
      } catch (err) {
        console.error("Google signup redirect failed:", err);
        setError("Could not start Google signup. Please try again.");
      }
    };

    startGoogleSignup();
  }, [fetchStatus, redirectUrlComplete, signUp]);

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Continue with Google</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to Clerk to complete sign up.
        </p>
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
    </div>
  );
}
