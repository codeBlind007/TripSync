"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { buildClientApiUrl } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Loader2, UserRound, Users } from "lucide-react";
import { toast } from "sonner";

interface InvitePreview {
  tripId: string;
  title: string;
  ownerName: string;
  collaboratorCount: number;
  inviteCode: string;
  isAlreadyCollaborator?: boolean;
}

export default function JoinInvitePage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ inviteCode: string }>();
  const inviteCode = Array.isArray(params.inviteCode)
    ? params.inviteCode[0]
    : params.inviteCode;

  const [preview, setPreview] = useState<InvitePreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (!isLoaded || !inviteCode) return;

    let active = true;

    const loadPreview = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = isSignedIn ? await getToken() : null;
        const res = await fetch(
          buildClientApiUrl(`/api/trips/invite/${inviteCode}`),
          {
            method: "GET",
            credentials: "include",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
              "Content-Type": "application/json",
            },
          },
        );

        const data = await res.json().catch(() => null);

        if (res.status === 401) {
          router.replace(
            `/login?redirect_url=${encodeURIComponent(pathname)}`,
          );
          return;
        }

        if (!res.ok) {
          throw new Error(data?.message || "Failed to load invite preview");
        }

        if (active) {
          setPreview(data?.data ?? null);
        }
      } catch (fetchError) {
        if (!active) return;

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load invite preview",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadPreview();

    return () => {
      active = false;
    };
  }, [getToken, inviteCode, isLoaded, isSignedIn, pathname, router]);

  const handleJoinTrip = async () => {
    if (!inviteCode || !preview) return;

    setIsJoining(true);

    try {
      const token = isSignedIn ? await getToken() : null;
      const res = await fetch(
        buildClientApiUrl(`/api/trips/join/${inviteCode}`),
        {
          method: "POST",
          credentials: "include",
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            "Content-Type": "application/json",
          },
        },
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Unable to join the trip");
      }

      toast.success(data?.message || "Joined the trip successfully");
      router.replace(
        `/triproom/${data?.data?._id ?? preview.tripId}`,
      );
    } catch (joinError) {
      toast.error(
        joinError instanceof Error
          ? joinError.message
          : "Unable to join the trip",
      );
    } finally {
      setIsJoining(false);
    }
  };

  if (!isLoaded || isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <Card className="w-full max-w-xl shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            <div>
              <p className="text-lg font-semibold text-slate-900">
                Loading invite
              </p>
              <p className="text-sm text-slate-600">
                We are checking this invite link and preparing the trip preview.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        <Card className="w-full max-w-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Invite unavailable</CardTitle>
            <CardDescription>
              This link could not be loaded. It may be invalid or expired.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                onClick={() => window.location.reload()}
                className="cursor-pointer"
              >
                Try again
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard")}
                className="cursor-pointer"
              >
                Go to dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.08),_transparent_32%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] p-4 sm:p-6">
      <Card className="w-full max-w-2xl overflow-hidden border-slate-200 shadow-xl">
        <CardHeader className="space-y-3 border-b bg-slate-50/80 px-6 py-5 sm:px-8">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
            <Users className="h-4 w-4" />
            Trip invitation
          </div>
          <CardTitle className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {preview?.title}
          </CardTitle>
          <CardDescription className="max-w-xl text-base text-slate-600">
            You were invited to join this trip by {preview?.ownerName}. There
            are {preview?.collaboratorCount ?? 0} collaborators already on this
            trip.
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 md:grid-cols-[1.4fr_0.9fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <UserRound className="h-4 w-4" />
                Owner
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {preview?.ownerName}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <Users className="h-4 w-4" />
                Collaborators
              </div>
              <p className="mt-2 text-xl font-semibold text-slate-950">
                {preview?.collaboratorCount} people
              </p>
              <p className="mt-2 text-sm text-slate-600">
                This trip is shared through an invite link.
              </p>
            </div>
          </div>

          <div className="flex h-full flex-col justify-center rounded-2xl border border-slate-200 bg-slate-950 p-6 text-slate-50">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
              Ready to join?
            </p>
            <h2 className="mt-3 text-2xl font-semibold">
              Open the trip room after joining.
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Joining will add your account to the collaborator list and take
              you directly to the trip room.
            </p>
            <Button
              type="button"
              size="lg"
              onClick={handleJoinTrip}
              disabled={isJoining}
              className="mt-6 w-full cursor-pointer bg-white text-slate-950 hover:bg-slate-100"
            >
              {isJoining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  Join Trip
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
            {preview?.isAlreadyCollaborator && (
              <p className="mt-4 text-sm text-slate-300">
                You are already part of this trip. Joining again is safe.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
