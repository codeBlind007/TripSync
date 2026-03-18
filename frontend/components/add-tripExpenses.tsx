"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { format } from "date-fns";
import {
  CalendarIcon,
  IndianRupee,
  Receipt,
  Users,
  ArrowLeft,
  Check,
  Loader2,
  Tag,
  FileText,
  Calculator,
  AlertCircle,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const expenseFormSchema = z.object({
  amount: z.number().min(1, "Amount must be at least ₹1"),
  category: z.string().min(1, "Please select a category"),
  note: z.string().min(1, "Please add a description for this expense"),
  date: z.date(),
  sharedWith: z.array(z.string().min(1, "Invalid user ID"))
    .min(1, "Select at least one person to share this expense with"),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormProps {
  tripId: string;
  currentUserId: string;
  collaborators: {_id: string, name: string}[];
}

const categories = [
  {
    value: "food",
    label: "Food & Dining",
    icon: "🍽️",
    color: "bg-orange-50 text-orange-700 border-orange-200",
  },
  {
    value: "transport",
    label: "Transportation",
    icon: "🚗",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "accommodation",
    label: "Accommodation",
    icon: "🏨",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "activities",
    label: "Activities",
    icon: "🎯",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "shopping",
    label: "Shopping",
    icon: "🛍️",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    value: "other",
    label: "Other",
    icon: "💰",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
];

export function ExpenseForm({ tripId, currentUserId, collaborators}: ExpenseFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      category: "",
      note: "",
      date: new Date(),
      sharedWith: [currentUserId], // Default to current user selected
    },
  });

  const amount = form.watch("amount");
  const category = form.watch("category");
  const note = form.watch("note");
  const date = form.watch("date");
  const sharedWith = form.watch("sharedWith");

  const watchedValues = form.watch();
  const selectedCollaborators = useMemo(() => {
    return collaborators.filter((c) => sharedWith?.includes(c._id));
  }, [collaborators, sharedWith]);

  const splitAmount = useMemo(() => {
    if (!amount || selectedCollaborators.length === 0) return 0;

    const participants = selectedCollaborators.some(
      (c) => c._id === currentUserId
    )
      ? selectedCollaborators
      : [...selectedCollaborators, { _id: currentUserId, name: "You" }];

    return amount / participants.length;
  }, [amount, selectedCollaborators, currentUserId]);



  async function onSubmit(data: ExpenseFormValues) {
    console.log("Form submission triggered", data);
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        spentBy: currentUserId, // Automatically set the current user as the payer
      };
      console.log("Submitting payload:", payload);
      const response = await fetch(
        `${API_BASE_URL}/api/trips/${tripId}/expenses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );
       const responseData = await response.json();
      if (!response.ok) {
        console.error("Error response:", responseData);
        throw new Error(responseData.message || "Failed to add expense");
      }

      toast.success("Expense added successfully! 🎉");
      form.reset();
      router.refresh();
      router.back();
    } catch (error) {
      console.error(error);
      toast.error("Failed to add expense. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const isStepValid = useCallback(
    (stepNumber: number) => {
      switch (stepNumber) {
        case 1:
          return amount > 0 && category && note;
        case 2:
          return date && sharedWith && sharedWith.length > 0;
        default:
          return false;
      }
    },
    [amount, category, note, date, sharedWith]
  );

  const nextStep = () => {
    if (step < 2) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

 

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Expense</h1>
          <p className="text-gray-600">Track a new expense for your trip</p>
        </div>
      </div>

      {/* Progress Indicator */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-700">
              Step {step} of 2
            </span>
            <span className="text-sm text-blue-600">
              {Math.round((step / 2) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 2) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-3 text-xs text-blue-600">
            <span className={step >= 1 ? "font-medium" : ""}>Details</span>
            <span className={step >= 2 ? "font-medium" : ""}>Sharing</span>
          </div>
        </CardContent>
      </Card>

      {/* Form */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (errors) =>  {
              console.log("Form errors:", errors);
            })} className="space-y-6">
              {/* Step 1: Expense Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-blue-50 rounded-full mb-3">
                      <Receipt className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Expense Details
                    </h3>
                    <p className="text-gray-600">Tell us about this expense</p>
                  </div>

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <IndianRupee className="h-4 w-4" />
                          Amount
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                              <IndianRupee className="h-4 w-4"></IndianRupee>
                            </span>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="pl-8 text-lg h-12 border-2 focus:border-blue-500"
                              {...field}
                              onChange={(e) =>
                                field.onChange(parseFloat(e.target.value) || 0)
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription>
                          Enter the total amount spent
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          Category
                        </FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-3">
                            {categories.map((category) => (
                              <div
                                key={category.value}
                                className={cn(
                                  "p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md",
                                  field.value === category.value
                                    ? category.color +
                                        " border-current shadow-md"
                                    : "border-gray-200 hover:border-gray-300"
                                )}
                                onClick={() => field.onChange(category.value)}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">
                                    {category.icon}
                                  </span>
                                  <div>
                                    <p className="font-medium text-sm">
                                      {category.label}
                                    </p>
                                  </div>
                                  {field.value === category.value && (
                                    <Check className="h-4 w-4 ml-auto" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="note"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="e.g., Dinner at Italian restaurant, Uber to airport..."
                            className="resize-none h-20 border-2 focus:border-blue-500"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Add details to help identify this expense later
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <CalendarIcon className="h-4 w-4" />
                          Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal h-12 border-2 hover:border-blue-300",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-3 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, "EEEE, MMMM do, yyyy")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>
                          When was this expense made?
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Sharing */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-3 bg-purple-50 rounded-full mb-3">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Share Expense
                    </h3>
                    <p className="text-gray-600">
                      Who should this expense be split between?
                    </p>
                  </div>

                  {/* Split Preview */}
                  {watchedValues.amount > 0 && (
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Calculator className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-blue-900">
                              Split Calculation
                            </span>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-blue-700">
                              ${watchedValues.amount.toFixed(2)} ÷{" "}
                              {
                                // Count includes the current user even if not explicitly selected
                                selectedCollaborators.some(
                                  (c) => c._id === currentUserId
                                )
                                  ? selectedCollaborators.length
                                  : selectedCollaborators.length + 1
                              }{" "}
                              people
                            </p>
                            <p className="text-lg font-bold text-blue-900">
                              ${splitAmount.toFixed(2)} per person
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <AlertCircle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          You are automatically included as the payer of this
                          expense.
                        </p>
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="sharedWith"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Split Between
                        </FormLabel>
                        <FormControl>
                          <div className="space-y-3">
                            {[
                              { _id: currentUserId, name: "You" },
                              ...collaborators.filter(
                                (c) => c._id !== currentUserId
                              ),
                            ].map((collaborator) => {
                              const isSelected = field.value?.includes(
                                collaborator._id
                              );
                              return (
                                <div
                                  key={collaborator._id}
                                  className={cn(
                                    "flex items-center justify-between p-4 rounded-lg border-2 transition-all",
                                    isSelected
                                      ? "border-blue-500 bg-blue-50 shadow-md"
                                      : "border-gray-200 hover:border-gray-300"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                      <AvatarFallback className="bg-purple-100 text-purple-700">
                                        {getInitials(collaborator.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <p className="font-medium text-gray-900">
                                        {collaborator.name}
                                      </p>
                                      {isSelected && splitAmount > 0 && (
                                        <p className="text-sm text-blue-600 font-medium">
                                          Owes ${splitAmount.toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {isSelected && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-700"
                                      >
                                        Selected
                                      </Badge>
                                    )}
                                    <Checkbox
                                      checked={isSelected}
                                      onCheckedChange={(checked) => {
                                        const currentValues = field.value || [];
                                        const newValues = checked
                                          ? [...currentValues, collaborator._id]
                                          : currentValues.filter(
                                              (id) => id !== collaborator._id
                                            );
                                        field.onChange(newValues);
                                      }}
                                      className="data-[state=checked]:bg-blue-600"
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormDescription>
                          Select all people who should share this expense
                          (including yourself)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Navigation Buttons */}
              <Separator />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 1}
                  className="gap-2 cursor-pointer"
                >
                  Previous
                </Button>

                <div className="flex gap-2">
                  {step < 2 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      disabled={!isStepValid(step)}
                      className="gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                    >
                      Continue
                      <ArrowLeft className="h-4 w-4 rotate-180" />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      disabled={isSubmitting || !isStepValid(2)}
                      className="gap-2 bg-green-600 hover:bg-green-700 min-w-32"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Add Expense
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Summary Preview */}
              {step === 2 && watchedValues.amount > 0 && (
                <Card className="bg-gray-50 border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-700">
                      Expense Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Amount:</span>
                      <span className="font-semibold">
                        ${watchedValues.amount.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">
                        {
                          categories.find(
                            (c) => c.value === watchedValues.category
                          )?.icon
                        }{" "}
                        {watchedValues.category}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Description:</span>
                      <span className="font-medium text-right max-w-40 truncate">
                        {watchedValues.note}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Paid by:</span>
                      <span className="font-medium">You</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Split between:</span>
                      <span className="font-medium">
                        {selectedCollaborators.length} people
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-sm font-bold">
                      <span>Per person:</span>
                      <span className="text-green-600">
                        ${splitAmount.toFixed(2)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );

  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
}
