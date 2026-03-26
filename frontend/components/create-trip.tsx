"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ChevronLeft,
  MapPin,
  Calendar,
  PenTool,
  Sparkles,
  AlertCircle,
  Plane,
  Camera,
} from "lucide-react";

interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  destination: string[];
}

interface FormErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  destination?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export default function CreateTripPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    destination: [""],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cleanedDestinations = formData.destination
    .map((d) => d.trim())
    .filter((d) => d.length > 0);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedTitle = formData.title.trim();
    const trimmedDescription = formData.description.trim();

    if (!trimmedTitle) {
      newErrors.title = "Trip title is required";
    } else if (trimmedTitle.length < 10) {
      newErrors.title = "Title must be at least 10 characters long";
    } else if (trimmedTitle.length > 50) {
      newErrors.title = "Title must not be more than 50 characters";
    }

    if (trimmedDescription.length > 150) {
      newErrors.description =
        "Description must not be more than 150 characters";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    } else if (
      formData.startDate &&
      new Date(formData.endDate) <= new Date(formData.startDate)
    ) {
      newErrors.endDate = "End date must be greater than start date";
    }

    if (cleanedDestinations.length === 0) {
      newErrors.destination = "At least one destination is required";
    } else if (cleanedDestinations.some((d) => d.length < 3)) {
      newErrors.destination =
        "Each destination must be at least 3 characters long";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }) as FormData);

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // Clear general error
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE_URL}/api/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
          destination: formData.destination,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to create trip");
      }

      // Show success state briefly before redirecting
      router.push("/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "Something went wrong while creating your trip. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.title.trim() &&
    formData.startDate &&
    formData.endDate &&
    cleanedDestinations.length > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-white hover:shadow-sm cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Create Your Next Adventure
            </h1>
            <p className="text-gray-600">
              Plan something amazing with friends and family
            </p>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Step 1 of 1
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
                <CardTitle className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Plane className="h-4 w-4 text-white" />
                  </div>
                  Trip Details
                </CardTitle>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Trip Title */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="title"
                      className="text-base font-medium text-gray-900 flex items-center gap-2"
                    >
                      <PenTool className="h-4 w-4 text-blue-600" />
                      Trip Title *
                    </Label>
                    <Input
                      id="title"
                      placeholder="e.g., Summer Adventure in Bali, Weekend City Break, Family Reunion Trip..."
                      value={formData.title}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      className={`h-12 text-base ${
                        errors.title
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isSubmitting}
                      maxLength={50}
                    />
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {errors.title && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.title}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formData.title.length}/50
                      </span>
                    </div>
                  </div>

                  {/* Trip Dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Start Date */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="startDate"
                        className="text-base font-medium text-gray-900 flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4 text-blue-600" />
                        Start Date *
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        className={`h-12 text-base ${
                          errors.startDate
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                        disabled={isSubmitting}
                      />
                      {errors.startDate && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.startDate}
                        </div>
                      )}
                    </div>

                    {/* End Date */}
                    <div className="space-y-3">
                      <Label
                        htmlFor="endDate"
                        className="text-base font-medium text-gray-900 flex items-center gap-2"
                      >
                        <Calendar className="h-4 w-4 text-blue-600" />
                        End Date *
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                        className={`h-12 text-base ${
                          errors.endDate
                            ? "border-red-500 focus:border-red-500"
                            : ""
                        }`}
                        disabled={isSubmitting}
                        min={formData.startDate || undefined}
                      />
                      {errors.endDate && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors.endDate}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Trip Description */}
                  <div className="space-y-3">
                    <Label
                      htmlFor="description"
                      className="text-base font-medium text-gray-900 flex items-center gap-2"
                    >
                      <Camera className="h-4 w-4 text-green-600" />
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Tell us about your trip! Where are you going? Who's joining you? What are you most excited about? Any special occasions or goals for this adventure?"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={5}
                      className={`text-base resize-none ${
                        errors.description
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isSubmitting}
                      maxLength={150}
                    />
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {errors.description && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.description}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formData.description.length}/150
                      </span>
                    </div>
                  </div>

                  {/* {Trip Destinations} */}

                  <div className="space-y-3">
                    <Label
                      htmlFor="destination"
                      className="text-base font-medium text-gray-900 flex items-center gap-2"
                    >
                      <MapPin className="h-4 w-4 text-green-600" />
                      Destination *
                    </Label>
                    <Textarea
                      id="destination"
                      placeholder="Enter destinations separated by commas"
                      value={formData.destination.join(", ")}
                      onChange={(e) =>
                        handleInputChange(
                          "destination",
                          e.target.value.split(","),
                        )
                      }
                      rows={5}
                      className={`text-base resize-none ${
                        errors.destination
                          ? "border-red-500 focus:border-red-500"
                          : ""
                      }`}
                      disabled={isSubmitting}
                      maxLength={500}
                    />
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        {errors.destination && (
                          <div className="flex items-center gap-2 text-red-600 text-sm">
                            <AlertCircle className="h-4 w-4" />
                            {errors.destination}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formData.destination.join(", ").length}/500
                      </span>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={!isFormValid || isSubmitting}
                      className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating Your Trip...
                        </>
                      ) : (
                        <>
                          <Plane className="mr-2 h-5 w-5" />
                          Create My Adventure
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Next Steps */}
          <div className="space-y-6">
            {/* Next Steps Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50 border-blue-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-900">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  What&#39;s Next?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="text-sm text-blue-800 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <p className="font-medium">Invite your crew</p>
                        <p className="text-blue-700 text-xs">
                          Add friends and family to collaborate
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <p className="font-medium">Plan activities</p>
                        <p className="text-blue-700 text-xs">
                          Create your perfect itinerary
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-300 text-white text-xs flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <p className="font-medium">Pack your bags</p>
                        <p className="text-blue-700 text-xs">
                          Create a shared packing list
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <Sparkles className="h-5 w-5 text-amber-600" />
                  Pro Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3 text-sm text-amber-800">
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                    <span>
                      Use descriptive titles to make your trip memorable
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                    <span>
                      Include everyone who might join in your description
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0"></div>
                    <span>You can always edit these details later</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
