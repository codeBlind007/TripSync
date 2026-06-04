"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { buildClientApiUrl } from "@/lib/client-api";

export function AuthSync() {
  const { isSignedIn, getToken } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || synced.current) return;

    synced.current = true;

    const syncUser = async () => {
      try {
        const token = await getToken();

        await fetch(buildClientApiUrl("/api/auth/oauth-callback"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token
              ? { Authorization: `Bearer ${token}` }
              : {}),
          },
        });
      } catch (err) {
        console.error("Auth sync failed:", err);
      }
    };

    void syncUser();
  }, [isSignedIn, getToken]);

  return null;
}

