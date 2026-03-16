"use client";
import {
  CalendarDays,
  MapPin,
  Clock,
  ChevronRight,
  Users,
  List,
  CheckCircle,
  DollarSign,
  ChevronLeft,
  MessageCircle,
} from "lucide-react";
import { Trip } from "./upcoming-trips";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const CompletedTripCard = ({ trip }: { trip: Trip }) => {
  const router = useRouter();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  const durationInDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const collaboratorsCount = trip.collaborators?.length || 0;
  const totalParticipants = collaboratorsCount + 1; // +1 for owner
  const tasksCount = trip.tasks?.length || 0;
  const completedTasksCount =
    trip.tasks?.filter((task) => task.completed).length || 0;
  const expensesTotal =
    trip.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const itineraryDays = trip.itinerary?.length || 0;

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white relative group overflow-hidden mb-6">
      {/* Colored Top Border for Status */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-500"></div>

      {/* Trip Header */}
      <CardHeader className="pb-4 pt-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl font-bold line-clamp-2 mb-2 text-gray-900">
              {trip.title}
            </CardTitle>
            {trip.description && (
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {trip.description}
              </p>
            )}
          </div>
          <div className="flex flex-col items-end gap-2 ml-4">
            <Badge
              variant="secondary"
              className="bg-slate-100 text-slate-700 border-slate-200 font-medium px-3 py-1"
            >
              Completed
            </Badge>
          </div>
        </div>

        {/* Date and Duration */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-500" />
            <span className="font-medium">
              {startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-500" />
            <span>
              {durationInDays} {durationInDays === 1 ? "day" : "days"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-6">
        {/* Collaborators */}
        {collaboratorsCount > 0 && (
          <div className="flex items-center gap-3 mb-5 pb-5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">
                {totalParticipants} traveler{totalParticipants !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex -space-x-2">
              {trip.collaborators.slice(0, 4).map((collaborator) => (
                <Avatar
                  key={collaborator._id}
                  className="h-8 w-8 border-2 border-white ring-1 ring-gray-200"
                >
                  <AvatarImage src={collaborator.avatar} />
                  <AvatarFallback className="text-xs bg-blue-100 text-blue-700 font-medium">
                    {collaborator.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {collaboratorsCount > 4 && (
                <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white ring-1 ring-gray-200 flex items-center justify-center">
                  <span className="text-xs font-medium text-gray-600">
                    +{collaboratorsCount - 4}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-100 hover:border-blue-200 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <List className="h-4 w-4 text-blue-600" />
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wide">
                Itinerary
              </span>
            </div>
            <div className="text-lg font-bold text-blue-900">
              {itineraryDays}
              <span className="text-sm font-normal text-blue-700 ml-1">
                {itineraryDays === 1 ? "day" : "days"}
              </span>
            </div>
          </div>

          <div className="bg-green-50 rounded-xl p-3.5 border border-green-100 hover:border-green-200 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs font-semibold text-green-800 uppercase tracking-wide">
                Tasks
              </span>
            </div>
            <div className="text-lg font-bold text-green-900">
              {completedTasksCount}/{tasksCount}
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-3.5 border border-purple-100 hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                Spent
              </span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              ${expensesTotal.toFixed(0)}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/itinerary/${trip._id}?isCompleted=${true}`)
            }
            className="flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-lg px-3"
          >
            <List className="h-4 w-4" />
            <span className="font-medium">Itinerary</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 hover:bg-orange-50 hover:text-orange-700 transition-colors rounded-lg px-3"
            onClick={() =>
              router.push(`/triproom/${trip._id}?isCompleted=${true}`)
            }
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Chat</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/tasks/${trip._id}?isCompleted=${true}`)
            }
            className="flex items-center gap-1.5 hover:bg-green-50 hover:text-green-700 transition-colors rounded-lg px-3"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Tasks</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/expenses/${trip._id}?isCompleted=${true}`)
            }
            className="flex items-center gap-1.5 hover:bg-purple-50 hover:text-purple-700 transition-colors rounded-lg px-3"
          >
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Expenses</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              router.push(`/collaborators/${trip._id}?isCompleted=${true}`)
            }
            className="flex items-center gap-1.5 hover:bg-orange-50 hover:text-orange-700 transition-colors rounded-lg px-3"
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">Collaborators</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CompletedTripsList({ trips }: { trips: Trip[] }) {
  const router = useRouter();
  if (trips.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full hover:bg-white hover:shadow-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Your Travel Memories
            </h1>
          </div>

          <div className="text-center py-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
            <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
              <MapPin className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No completed trips yet
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Once you complete your adventures, they&#39;ll appear here as
              beautiful memories to look back on.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start gap-3 sm:items-center sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-white hover:shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Your Travel Memories
            </h1>
            <p className="text-gray-600 mt-1">
              {trips.length} completed{" "}
              {trips.length === 1 ? "adventure" : "adventures"}
            </p>
          </div>
        </div>

        {/* Trips Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <CompletedTripCard key={trip._id} trip={trip} />
          ))}
        </div>

        {/* Summary Stats */}
        {trips.length > 0 && (
          <div className="mt-12 rounded-2xl border border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-5 sm:p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {trips.length}
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wider font-medium">
                  Completed Trips
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {trips.reduce((total, trip) => {
                    const start = new Date(trip.startDate);
                    const end = new Date(trip.endDate);
                    const diffTime = Math.abs(end.getTime() - start.getTime());
                    const diffDays = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    );
                    return total + diffDays;
                  }, 0)}
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wider font-medium">
                  Total Days Traveled
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {trips.reduce((total, trip) => {
                    return total + (trip.destination.length || 0);
                  }, 0)}
                </div>
                <div className="text-gray-600 text-sm uppercase tracking-wider font-medium">
                  Locations Explored
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
