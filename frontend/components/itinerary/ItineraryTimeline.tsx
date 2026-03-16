"use client";

import { DayCard } from "./DayCard";
import type { ItineraryDay } from "./ItineraryClient";

interface ItineraryTimelineProps {
  itinerary: ItineraryDay[];
  tripId: string;
  isCompleted?: boolean;
}

export function ItineraryTimeline({
  itinerary,
  tripId,
  isCompleted,
}: ItineraryTimelineProps) {
  const startDate = itinerary.length > 0 ? itinerary[0].date : "";

  return (
    <div className="space-y-6 sm:space-y-8">
      {itinerary.map((day, dayIndex) => (
        <div key={day.date} className="relative">
          {/* Timeline connector */}
          {dayIndex < itinerary.length - 1 && (
            <div className="absolute left-8 top-20 z-0 hidden h-full w-0.5 bg-gradient-to-b from-blue-200 to-purple-200 sm:block"></div>
          )}

          <DayCard
            day={day}
            dayIndex={dayIndex}
            startDate={startDate}
            tripId={tripId}
            itineraryId={day._id}
            isCompleted={isCompleted}
          />
        </div>
      ))}
    </div>
  );
}
