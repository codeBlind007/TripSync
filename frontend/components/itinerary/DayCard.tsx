"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { ActivityCard } from "./ActivityCard";
import type { ItineraryDay } from "./ItineraryClient";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DayCardProps {
  day: ItineraryDay;
  dayIndex: number;
  startDate: string;
  tripId: string;
  itineraryId: string;
  isCompleted?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function DayCard({
  day,
  startDate,
  tripId,
  itineraryId,
  isCompleted,
}: DayCardProps) {
  const router = useRouter();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDayNumber = (dateString: string, startDate: string) => {
    const current = new Date(dateString);
    const start = new Date(startDate);
    const diffTime = Math.abs(current.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1;
  };

  const handleDeleteItinerary = async () => {
    const res = await fetch(
      `${API_BASE_URL}/api/trips/${tripId}/itinerary/${itineraryId}`,
      {
        method: "DELETE",
        credentials: "include",
      },
    );

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      console.error(data.message);
    }
  };

  const dayNumber = getDayNumber(day.date, startDate);

  return (
    <div className="relative z-10">
      {/* Day Header */}
      <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:gap-6">
        <div className="flex items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-base font-bold text-white shadow-lg sm:h-16 sm:w-16 sm:text-lg">
            {dayNumber}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-gray-900 sm:text-2xl">
              {formatDate(day.date)}
            </h2>
            <p className="text-sm text-gray-600 sm:text-base">
              {day.activities.length}{" "}
              {day.activities.length === 1 ? "activity" : "activities"} planned
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Badge
            variant="secondary"
            className="border-blue-200 bg-blue-100 text-blue-800"
          >
            Day {dayNumber}
          </Badge>
          {!isCompleted && (
            <>
              <Button
                asChild
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                <Link href={`/itinerary/${tripId}/edit/${day._id}`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Activity
                </Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 cursor-pointer"
                  >
                    <Trash2 className="mr-2 h-4 w-4 cursor-pointer" />
                    Delete Day
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Day {dayNumber}?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove this day and all of its
                      activities. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteItinerary}
                      className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
                    >
                      Delete Day
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Activities */}
      <div className="space-y-3 sm:ml-20 sm:space-y-4">
        {day.activities.map((activity, activityIndex) => (
          <ActivityCard
            key={activity.activityId}
            activity={activity}
            activityIndex={activityIndex}
            isLastActivity={activityIndex === day.activities.length - 1}
            tripId={tripId}
            dayId={day._id}
            isCompleted={isCompleted}
          />
        ))}
      </div>
    </div>
  );
}
