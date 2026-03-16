"use client";

import { ItineraryHeader } from "./ItineraryHeader";
import { ItineraryStats } from "./ItineraryStats";
import { ItineraryTimeline } from "./ItineraryTimeline";
import { EmptyState } from "./EmptyState";
import { AddMoreCTA } from "./AddMoreCTA";

export interface Activity {
  activityId: string;
  time: string;
  title: string;
  location: string;
  notes: string;
}

export interface ItineraryDay {
  date: string;
  activities: Activity[];
  _id: string;
}

interface ItineraryClientProps {
  itinerary: ItineraryDay[];
  tripId: string;
  isCompleted: boolean;
}

export function ItineraryClient({
  itinerary,
  tripId,
  isCompleted,
}: ItineraryClientProps) {
  const totalActivities = itinerary.reduce(
    (total, day) => total + day.activities.length,
    0,
  );
  const totalDays = itinerary.length;

  if (itinerary.length === 0) {
    return <EmptyState tripId={tripId} isCompleted={isCompleted} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">
        <ItineraryHeader
          tripId={tripId}
          totalDays={totalDays}
          totalActivities={totalActivities}
          isCompleted={isCompleted}
        />

        <ItineraryStats
          totalDays={totalDays}
          totalActivities={totalActivities}
        />

        <ItineraryTimeline
          itinerary={itinerary}
          tripId={tripId}
          isCompleted={isCompleted}
        />

        {!isCompleted && <AddMoreCTA tripId={tripId} />}
      </div>
    </div>
  );
}
