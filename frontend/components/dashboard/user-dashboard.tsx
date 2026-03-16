"use client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  MapPin,
  Clock,
  Plane,
  Camera,
  TrendingUp,
  Users,
  CheckCircle2,
  Plus,
  LucideIcon,
  DollarSign,
  CheckSquare,
  FileText,
} from "lucide-react";
import { useState } from "react";

interface UpcomingTrip {
  id: string;
  destination: string;
  description?: string;
  dates: string;
  daysLeft?: number;
  status?: string;
  collaborators: number;
  tasksProgress: string;
  totalExpenses: number;
}

interface RecentTrip {
  id: string;
  destination: string;
  dates: string;
  collaborators: number;
  hasStory: boolean;
  totalExpenses: number;
}

interface Stat {
  label: string;
  value: number;
  icon: string;
}

interface User {
  name: string;
}

interface DashboardClientProps {
  upcomingTrips: UpcomingTrip[];
  recentTrips: RecentTrip[];
  stats: Stat[];
  user: User;
}

const iconMap: Record<string, LucideIcon> = {
  MapPin: MapPin,
  Plane: Plane,
  DollarSign: DollarSign,
  CalendarDays: CalendarDays,
};

export default function DashboardClient({
  upcomingTrips,
  recentTrips,
  stats,
  user,
}: DashboardClientProps) {
  const [isAddingTrip, setIsAddingTrip] = useState(false);
  const router = useRouter();

  // Handler for adding a new trip
  const handleAddTrip = () => {
    setIsAddingTrip(true);
    // Navigate to trip creation page
    router.push("/dashboard/create-trip");
  };

  // Handler for viewing a trip
  const handleViewTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-1 sm:gap-5 sm:p-2 md:gap-6 md:p-4">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Welcome back, {user.name}!
        </h1>
        <p className="text-muted-foreground">
          Here&#39;s what&apos;s happening with your travels
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const IconComponent = iconMap[stat.icon];
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  {IconComponent && (
                    <IconComponent className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Upcoming Trips */}
        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                Upcoming Trips
              </CardTitle>
              <CardDescription>Your next adventures await</CardDescription>
            </div>
            <Button size="sm" onClick={handleAddTrip} disabled={isAddingTrip}>
              <Plus className="h-4 w-4 mr-2" />
              New Trip
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingTrips.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming trips planned</p>
                <Button
                  variant="outline"
                  onClick={handleAddTrip}
                  className="mt-4"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Plan Your First Trip
                </Button>
              </div>
            ) : (
              upcomingTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                  onClick={() => handleViewTrip(trip.id)}
                >
                  <div className="flex items-start space-x-3 sm:items-center sm:space-x-4">
                    <div className="text-2xl">✈️</div>
                    <div className="min-w-0">
                      <h4 className="font-semibold">{trip.destination}</h4>
                      <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-1">
                        <CalendarDays className="h-3 w-3" />
                        {trip.dates}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {trip.collaborators + 1} people
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <CheckSquare className="h-3 w-3" />
                          {trip.tasksProgress} tasks
                        </span>
                        {trip.totalExpenses > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />$
                            {trip.totalExpenses}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1 sm:text-right">
                    <Badge
                      variant={
                        trip.status === "Ready" ? "default" : "secondary"
                      }
                    >
                      {trip.status}
                    </Badge>
                    {trip.daysLeft !== undefined && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {trip.daysLeft > 0
                          ? `${trip.daysLeft} days left`
                          : "Started"}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with your next trip</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleAddTrip}
            >
              <Plus className="h-4 w-4 mr-2" />
              Plan New Trip
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/trips")}
            >
              <Plane className="h-4 w-4 mr-2" />
              View All Trips
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/stories")}
            >
              <Camera className="h-4 w-4 mr-2" />
              Write Travel Story
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/resources")}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Browse Resources
            </Button>
          </CardContent>
        </Card>

        {/* Recent Trips */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Recent Trips
            </CardTitle>
            <CardDescription>Your latest adventures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentTrips.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No completed trips yet</p>
              </div>
            ) : (
              recentTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleViewTrip(trip.id)}
                >
                  <div className="text-xl">🏖️</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">{trip.destination}</h4>
                    <p className="text-sm text-muted-foreground">
                      {trip.dates}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {trip.hasStory && (
                        <Badge variant="outline" className="text-xs">
                          <FileText className="h-3 w-3 mr-1" />
                          Story
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {trip.collaborators + 1} people
                      </span>
                    </div>
                  </div>
                  {trip.totalExpenses > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        ${trip.totalExpenses}
                      </p>
                      <p className="text-xs text-muted-foreground">spent</p>
                    </div>
                  )}
                </div>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => router.push("/trips")}
            >
              View All Trips
            </Button>
          </CardContent>
        </Card>

        {/* Travel Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Travel Goals 2025
            </CardTitle>
            <CardDescription>Your progress this year</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Destinations</span>
                <span>{Math.min(stats[0]?.value || 0, 10)}/10</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((stats[0]?.value || 0) * 10, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Travel Stories</span>
                <span>{Math.min(stats[2]?.value || 0, 12)}/12</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((stats[2]?.value || 0) * 8.33, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Days Traveled</span>
                <span>{Math.min(stats[3]?.value || 0, 60)}/60</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{
                    width: `${Math.min((stats[3]?.value || 0) * 1.67, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {upcomingTrips.slice(0, 2).map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-start space-x-3 text-sm"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p>
                      <strong>{trip.destination}</strong> trip planning in
                      progress
                    </p>
                    <p className="text-muted-foreground text-xs">
                      Tasks: {trip.tasksProgress}
                    </p>
                  </div>
                </div>
              ))}
              {recentTrips.slice(0, 1).map((trip) => (
                <div
                  key={trip.id}
                  className="flex items-start space-x-3 text-sm"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p>
                      <strong>{trip.destination}</strong> trip completed
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {trip.hasStory ? "Story written" : "No story yet"}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingTrips.length === 0 && recentTrips.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm">No recent activity</p>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => router.push("/trips")}
            >
              View All Trips
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
