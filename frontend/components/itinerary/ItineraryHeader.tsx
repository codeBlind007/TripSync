"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ItineraryHeaderProps {
  tripId: string;
  totalDays: number;
  totalActivities: number;
  isCompleted?: boolean;
}

export function ItineraryHeader({
  tripId,
  totalDays,
  totalActivities,
  isCompleted,
}: ItineraryHeaderProps) {
  const router = useRouter();
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3 sm:items-center sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Trip Itinerary
          </h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">
            {totalDays} {totalDays === 1 ? "day" : "days"} • {totalActivities}{" "}
            {totalActivities === 1 ? "activity" : "activities"} planned
          </p>
        </div>
      </div>
      <div className="flex w-full gap-2 sm:w-auto sm:justify-end">
        {!isCompleted && (
          <Button
            asChild
            className="w-full bg-blue-600 hover:bg-blue-700 sm:w-auto"
          >
            <Link href={`/itinerary/${tripId}/add`}>
              <Plus className="h-4 w-4 mr-2" />
              New Itinerary Day
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
