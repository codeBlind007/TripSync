"use client";

import React, { useEffect, useState } from "react";
import {
  Calendar,
  MessageSquare,
  Plus,
  List,
  DollarSign,
  Users,
  CheckCircle,
  Clock,
  MessageCircle,
  ChevronRight,
  AlertCircle,
  CalendarDays,
  MoreHorizontal,
  Share2,
  ChevronLeft,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";

export type Activity = {
  activityId: string;
  time?: string;
  title?: string;
  location?: string;
  notes?: string;
};

export type ItineraryDay = {
  date: string;
  activities: Activity[];
};

export type Task = {
  taskId: string;
  text: string;
  assignedTo?: string;
  completed: boolean;
};

export type Expense = {
  amount: number;
  category?: string;
  spentBy?: string;
  sharedWith?: string[];
  note?: string;
  date: string;
};

export type ChatMessage = {
  sender: string;
  message: string;
  sentAt: string;
};

export type PendingInvite = {
  user: string;
  invitedAt: string;
  status: "pending" | "accepted" | "rejected";
};

export type Collaborator = {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
};

export type Trip = {
  _id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  owner: string;
  collaborators: Collaborator[];
  tasks: Task[];
  expenses: Expense[];
  itinerary: ItineraryDay[];
  chatMessages: ChatMessage[];
  pendingInvites: PendingInvite[];
  createdOn: string;
  destination: string[];
};

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const TripCard = ({ trip }: { trip: Trip }) => {
  const router = useRouter();
  const today = new Date();
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);

  const durationInDays = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  const daysUntilTrip = Math.ceil(
    (startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isStartingSoon = daysUntilTrip <= 7 && daysUntilTrip > 0;
  const isStartingToday = daysUntilTrip === 0;
  const isOverdue = daysUntilTrip < 0;

  const collaboratorsCount = trip.collaborators?.length || 0;
  const totalParticipants = collaboratorsCount + 1; // +1 for owner
  const tasksCount = trip.tasks?.length || 0;
  const completedTasksCount =
    trip.tasks?.filter((task) => task.completed).length || 0;
  const expensesTotal =
    trip.expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const itineraryDays = trip.itinerary?.length || 0;
  const pendingInvitesCount =
    trip.pendingInvites?.filter((invite) => invite.status === "pending")
      .length || 0;
  const unreadMessages = trip.chatMessages?.length || 0;

  // Calculate completion percentage
  const completionItems = [
    { completed: itineraryDays > 0, weight: 30 },
    { completed: tasksCount > 0, weight: 25 },
    {
      completed: completedTasksCount === tasksCount && tasksCount > 0,
      weight: 25,
    },
    { completed: collaboratorsCount > 0, weight: 20 },
  ];

  const completionPercentage = Math.round(
    completionItems.reduce(
      (acc, item) => acc + (item.completed ? item.weight : 0),
      0,
    ),
  );

  const getStatusColor = () => {
    if (isOverdue) return "bg-red-500";
    if (isStartingToday) return "bg-green-500";
    if (isStartingSoon) return "bg-amber-500";
    return "bg-blue-500";
  };

  const getStatusText = () => {
    if (isOverdue) return "In Progress";
    if (isStartingToday) return "Starting Today!";
    if (isStartingSoon) return `${daysUntilTrip} days to go`;
    if (daysUntilTrip <= 30) return `${daysUntilTrip} days away`;
    return "Upcoming";
  };

  return (
    <Card className="hover:shadow-xl transition-all duration-300 border border-gray-200 bg-white relative group overflow-hidden mb-6">
      {/* Colored Top Border for Status */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${getStatusColor()}`}
      ></div>

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
              className={`${getStatusColor()} text-white border-0 font-medium px-3 py-1`}
            >
              {getStatusText()}
            </Badge>
            {pendingInvitesCount > 0 && (
              <Badge
                variant="outline"
                className="text-xs bg-amber-50 text-amber-700 border-amber-200 px-2 py-1"
              >
                {pendingInvitesCount} pending invite
                {pendingInvitesCount !== 1 ? "s" : ""}
              </Badge>
            )}
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
              })}
              {" - "}
              {endDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year:
                  startDate.getFullYear() !== endDate.getFullYear()
                    ? "numeric"
                    : undefined,
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

        {/* Trip Progress */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Trip Planning
            </span>
            <span className="text-sm font-semibold text-gray-900">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 h-2.5 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
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
                {itineraryDays === 1 ? "day" : "days"} planned
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
              <span className="text-sm font-normal text-green-700 ml-1">
                completed
              </span>
            </div>
          </div>

          <div className="bg-purple-50 rounded-xl p-3.5 border border-purple-100 hover:border-purple-200 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-800 uppercase tracking-wide">
                Budget
              </span>
            </div>
            <div className="text-lg font-bold text-purple-900">
              ${expensesTotal.toFixed(0)}
              <span className="text-sm font-normal text-purple-700 ml-1">
                planned
              </span>
            </div>
          </div>

          <div className="bg-amber-50 rounded-xl p-3.5 border border-amber-100 hover:border-amber-200 transition-colors">
            <div className="flex items-center gap-2 mb-1.5">
              <MessageSquare className="h-4 w-4 text-amber-600" />
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wide">
                Activity
              </span>
            </div>
            <div className="text-lg font-bold text-amber-900">
              {unreadMessages}
              <span className="text-sm font-normal text-amber-700 ml-1">
                message{unreadMessages !== 1 ? "s" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-2 pt-5 border-t border-gray-100">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/itinerary/${trip._id}`)}
            className="flex items-center gap-1.5 hover:bg-blue-50 hover:text-blue-700 transition-colors rounded-lg px-3"
          >
            <List className="h-4 w-4" />
            <span className="font-medium">Itinerary</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/expenses/${trip._id}`)}
            className="flex items-center gap-1.5 hover:bg-purple-50 hover:text-purple-700 transition-colors rounded-lg px-3"
          >
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">Expenses</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/tasks/${trip._id}`)}
            className="flex items-center gap-1.5 hover:bg-green-50 hover:text-green-700 transition-colors rounded-lg px-3"
          >
            <CheckCircle className="h-4 w-4" />
            <span className="font-medium">Tasks</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 hover:bg-orange-50 hover:text-orange-700 transition-colors rounded-lg px-3"
            onClick={() => router.push(`/triproom/${trip._id}`)}
          >
            <MessageCircle className="h-4 w-4" />
            <span className="font-medium">Chat</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 hover:bg-orange-50 hover:text-orange-700 transition-colors rounded-lg px-3"
            onClick={() => router.push(`/collaborators/${trip._id}`)}
          >
            <Users className="h-4 w-4" />
            <span className="font-medium">Collaborators</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>

      {/* Hover Actions */}
      <div className="absolute top-6 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-white shadow-md hover:shadow-lg rounded-lg border border-gray-200"
        >
          <Share2 className="h-4 w-4 text-gray-600" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 bg-white shadow-md hover:shadow-lg rounded-lg border border-gray-200"
        >
          <MoreHorizontal className="h-4 w-4 text-gray-600" />
        </Button>
      </div>
    </Card>
  );
};

const UpcomingTrips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  useEffect(() => {
    const getUpcomingTrips = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/upcoming-trips`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch upcoming trips");

        const data = await res.json();
        setTrips(data.data.upComingTrips || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Something went wrong");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getUpcomingTrips();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-[300px]" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-2 w-full" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Error loading trips:</strong> {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="mx-auto mt-4 max-w-7xl space-y-6 px-3 py-2 sm:mt-6 sm:space-y-8 sm:px-4 md:mt-8 md:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="rounded-full hover:bg-white hover:shadow-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Upcoming Adventures
          </h1>
        </div>
        <Button
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          onClick={() => router.push("/dashboard/create-trip")}
        >
          <Plus className="h-4 w-4" />
          New Trip
        </Button>
      </div>
      <p className="text-gray-600 sm:-mt-3">
        {trips.length > 0
          ? `You have ${trips.length} upcoming ${
              trips.length === 1 ? "trip" : "trips"
            }`
          : "No upcoming trips planned"}
      </p>

      {trips.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Ready for your next adventure?
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-6">
              Create your first trip and start planning an amazing journey with
              friends and family.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              onClick={() => router.replace("/dashboard/create-trip")}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {trips.map((trip) => (
            <TripCard key={trip._id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingTrips;
