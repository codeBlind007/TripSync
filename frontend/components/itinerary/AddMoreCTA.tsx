"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

interface AddMoreCTAProps {
  tripId: string;
}

export function AddMoreCTA({ tripId }: AddMoreCTAProps) {
  return (
    <div className="mt-12 text-center">
      <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 p-8 hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Plus className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Add more to your itinerary
            </h3>
            <p className="text-gray-600 mb-4">
              Keep building your perfect trip with more activities and
              experiences
            </p>
          </div>
          <Button asChild className="bg-blue-600 hover:bg-blue-700">
            <Link href={`/itinerary/${tripId}/add`}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Itinerary Day
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
