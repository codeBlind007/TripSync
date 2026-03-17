"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Plus,
  CalendarDays,
  Clock,
  MapPin,
  NotebookText,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface EmptyStateProps {
  tripId: string;
  isCompleted?: boolean;
}

export function EmptyState({ tripId, isCompleted }: EmptyStateProps) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              asChild
              className="rounded-full cursor-pointer"
              onClick={() => router.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Trip Itinerary
              </h1>
              <p className="text-gray-600 mt-1">Plan your perfect adventure</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isCompleted && (
              <Button asChild className="bg-blue-600 hover:bg-blue-700 cursor-pointer">
                <Link href={`/itinerary/${tripId}/edit/}`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Activities
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Empty State */}
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center max-w-lg">
            <div className="w-24 h-24 mx-auto mb-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <CalendarDays className="h-12 w-12 text-blue-600" />
            </div>

            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Your adventure awaits
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Create your perfect itinerary by adding activities, places to
              visit, and experiences to remember. Build your day-by-day plan and
              never miss a moment.
            </p>

            <div className="space-y-4">
              {!isCompleted && (
                <Button
                  size="lg"
                  asChild
                  className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  <Link href={`/itinerary/${tripId}/add`}>
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Itinerary
                  </Link>
                </Button>
              )}

              <div className="flex items-center justify-center gap-8 mt-8 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Schedule activities</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Add locations</span>
                </div>
                <div className="flex items-center gap-2">
                  <NotebookText className="h-4 w-4" />
                  <span>Include notes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
