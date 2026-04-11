"use client";

import { useEffect } from "react";
import { AlertTriangle, ArrowLeft, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const safeErrorMessage =
    error?.message?.trim() || "We could not load collaborators for this trip.";

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.18),transparent_45%),radial-gradient(circle_at_80%_75%,rgba(2,132,199,0.14),transparent_50%)]" />

      <Card className="w-full max-w-lg border-red-200/70 bg-background/90 shadow-lg backdrop-blur-sm">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle className="h-7 w-7" aria-hidden="true" />
          </div>
          <CardTitle className="text-xl sm:text-2xl">
            Collaborators Unavailable
          </CardTitle>
          <CardDescription className="text-sm leading-relaxed sm:text-base">
            Something broke while loading this trip room. You can try again or
            return to the dashboard.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {safeErrorMessage}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full sm:w-auto hover:cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto hover:cursor-pointer"
            >
              <RefreshCcw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
