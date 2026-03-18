"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Clock,
  MapPin,
  NotebookText,
  Check,
  Loader2,
  ChevronLeft,
  Calendar,
  AlertCircle,
  Save,
  Trash2,
  Edit3,
  Plus,
  Timer,
  Navigation,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

interface ActivityFormData {
  title: string;
  time: string;
  location: string;
  notes: string;
}

interface EditActivityClientProps {
  tripId: string;
  itineraryId: string;
  activityId?: string;
  initialData?: ActivityFormData;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function EditActivityClient({
  tripId,
  itineraryId,
  activityId,
  initialData,
}: EditActivityClientProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<ActivityFormData>({
    title: initialData?.title || "",
    time: initialData?.time || "",
    location: initialData?.location || "",
    notes: initialData?.notes || "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ActivityFormData>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isEditing = !!activityId;

  const validateForm = () => {
    const newErrors: Partial<ActivityFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Activity title is required";
    }

    if (!formData.time) {
      newErrors.time = "Time is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name as keyof ActivityFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const url = isEditing
        ? `${API_BASE_URL}/api/trips/${tripId}/itinerary/${itineraryId}/activities/${activityId}`
        : `${API_BASE_URL}/api/trips/${tripId}/itinerary/${itineraryId}`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${isEditing ? "update" : "create"} activity`,
        );
      }

      toast.success(
        `Activity ${isEditing ? "updated" : "created"} successfully!`,
        {
          description: `"${formData.title}" has been ${isEditing ? "updated" : "added to your itinerary"}.`,
        },
      );
      router.push(`/itinerary/${tripId}`);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Failed to ${isEditing ? "update" : "create"} activity`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEditing) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${tripId}/itinerary/${itineraryId}/activities/${activityId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete activity");
      }

      toast.success("Activity deleted successfully", {
        description: `"${formData.title}" has been removed from your itinerary.`,
      });
      router.push(`/itinerary/${tripId}`);
      router.refresh();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to delete activity");
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  const formatTimeDisplay = (time: string) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const hour12 = parseInt(hours) % 12 || 12;
    const ampm = parseInt(hours) >= 12 ? "PM" : "AM";
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/itinerary/${tripId}`)}
            className="rounded-full hover:bg-white hover:shadow-sm cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                {isEditing ? (
                  <Edit3 className="h-4 w-4 text-white" />
                ) : (
                  <Plus className="h-4 w-4 text-white" />
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEditing ? "Edit Activity" : "Add New Activity"}
              </h1>
            </div>
            <p className="text-gray-600">
              {isEditing
                ? "Update the details of your activity"
                : "Add a new activity to your itinerary"}
            </p>
          </div>
          {isEditing && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Editing
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50/50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Activity Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Activity Title */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="title"
                      className="text-base font-medium text-gray-900"
                    >
                      Activity Title *
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="e.g., Visit Eiffel Tower, Lunch at local café..."
                      className={`h-12 text-base ${errors.title ? "border-red-500 focus:border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.title && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.title}
                      </div>
                    )}
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="time"
                      className="text-base font-medium text-gray-900 flex items-center gap-2"
                    >
                      <Timer className="h-4 w-4 text-purple-600" />
                      Time *
                    </Label>
                    <div className="relative">
                      <Input
                        id="time"
                        name="time"
                        type="time"
                        value={formData.time}
                        onChange={handleChange}
                        className={`h-12 text-base ${errors.time ? "border-red-500 focus:border-red-500" : ""}`}
                        disabled={isLoading}
                      />
                      {formData.time && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-50 text-purple-700 border-purple-200 "
                          >
                            {formatTimeDisplay(formData.time)}
                          </Badge>
                        </div>
                      )}
                    </div>
                    {errors.time && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.time}
                      </div>
                    )}
                  </div>

                  {/* Location */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="location"
                      className="text-base font-medium text-gray-900 flex items-center gap-2"
                    >
                      <Navigation className="h-4 w-4 text-orange-600" />
                      Location *
                    </Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="e.g., Champ de Mars, 5 Avenue Anatole France, 75007 Paris"
                      className={`h-12 text-base ${errors.location ? "border-red-500 focus:border-red-500" : ""}`}
                      disabled={isLoading}
                    />
                    {errors.location && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors.location}
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="notes"
                      className="text-base font-medium text-gray-900 flex items-center gap-2"
                    >
                      <StickyNote className="h-4 w-4 text-green-600" />
                      Notes & Details
                      <Badge
                        variant="secondary"
                        className="text-xs bg-gray-100 text-gray-600"
                      >
                        Optional
                      </Badge>
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any special instructions, booking details, or reminders..."
                      rows={4}
                      className="text-base resize-none"
                      disabled={isLoading}
                    />
                  </div>

                  <Separator />

                  {/* Action Buttons */}
                  <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {isEditing && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isLoading}
                        className="w-full sm:w-auto sm:min-w-40 cursor-pointer"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Activity
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push(`/itinerary/${tripId}`)}
                        disabled={isLoading}
                        className="w-full sm:w-auto sm:min-w-28 text-sm sm:text-base cursor-pointer"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto sm:min-w-44 text-sm sm:text-base px-2 sm:px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 cursor-pointer"
                      >
                        {isLoading ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="hidden sm:inline mr-2 h-4 w-4" />
                        )}
                        <span className="sm:hidden">
                          {isEditing ? "Update" : "Create"}
                        </span>
                        <span className="hidden sm:inline">
                          {isEditing ? "Update Activity" : "Create Activity"}
                        </span>
                      </Button>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Preview & Tips */}
          <div className="space-y-6">
            {/* Activity Preview */}
            {(formData.title || formData.time || formData.location) && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50/50 border-b border-green-100">
                  <CardTitle className="flex items-center gap-2 text-green-900">
                    <Check className="h-5 w-5 text-green-600" />
                    Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {formData.title && (
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {formData.title}
                        </h3>
                      </div>
                    )}

                    {formData.time && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">
                          {formatTimeDisplay(formData.time)}
                        </span>
                      </div>
                    )}

                    {formData.location && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span>{formData.location}</span>
                      </div>
                    )}

                    {formData.notes && (
                      <div className="flex items-start gap-2 text-sm text-gray-600">
                        <NotebookText className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{formData.notes}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  Quick Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm text-blue-800">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>
                      Be specific with your activity titles to make them
                      memorable
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>Include full addresses for easy navigation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>
                      Add booking confirmations and special requirements in
                      notes
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                    <span>Consider travel time between activities</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <AlertDialog
          open={showDeleteConfirm}
          onOpenChange={(open) => {
            if (!isLoading) {
              setShowDeleteConfirm(open);
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-900">
                <AlertCircle className="h-5 w-5 text-red-600 " />
                Delete Activity
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{formData.title}&quot;?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="cursor-pointer"
                disabled={isLoading}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isLoading}
                className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
