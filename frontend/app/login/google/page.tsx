"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSignIn } from "@clerk/nextjs";

export default function GoogleLoginPage() {
  const { fetchStatus, signIn } = useSignIn();
  const startGoogleLoginStarted = useRef(false);
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  // Show manual button after 2s in case auto-redirect is blocked (common on mobile)
  const [showFallback, setShowFallback] = useState(false);
  const redirectUrl = searchParams.get("redirect_url");
  const invite = searchParams.get("invite");

  const redirectUrlComplete = useMemo(() => {
    if (redirectUrl) return redirectUrl;
    return invite ? `/dashboard?invite=${invite}` : "/dashboard";
  }, [invite, redirectUrl]);

  const startGoogleLogin = async () => {
    if (!signIn) return;
    if (startGoogleLoginStarted.current) return;
    startGoogleLoginStarted.current = true;
    setShowFallback(false);

    try {
      await signIn.sso({
        strategy: "oauth_google",
        redirectUrl: redirectUrlComplete,
        redirectCallbackUrl: "/login/google/callback",
      });
    } catch (err) {
      console.error("Google login redirect failed:", err);
      startGoogleLoginStarted.current = false;
      setError("Could not start Google login. Please try again.");
      setShowFallback(true);
    }
  };

  useEffect(() => {
    if (fetchStatus !== "idle" || !signIn) return;
    void startGoogleLogin();

    // Fallback: if still on this page after 2 seconds, the auto-redirect
    // was likely blocked by the mobile browser — show a manual button.
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 2000);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchStatus, signIn]);

  return (
    <div className="bg-muted flex min-h-svh items-center justify-center p-6">
      <div className="max-w-sm rounded-2xl border bg-background p-6 text-center shadow-sm">
        <h1 className="text-xl font-semibold">Continue with Google</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Redirecting you to Google to complete sign in.
        </p>
        {showFallback && !error && (
          <button
            onClick={() => {
              startGoogleLoginStarted.current = false;
              void startGoogleLogin();
            }}
            className="mt-4 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Tap here to continue with Google
          </button>
        )}
        {error && (
          <>
            <p className="mt-4 text-sm text-destructive">{error}</p>
            <button
              onClick={() => {
                startGoogleLoginStarted.current = false;
                setError(null);
                void startGoogleLogin();
              }}
              className="mt-3 w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
