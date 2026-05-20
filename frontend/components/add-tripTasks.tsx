"use client";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "./ui/button";
import {
  Plus,
  User,
  Calendar,
  Flag,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface AddTaskProps {
  tripId: string;
  users: User[];
}

interface FormData {
  text: string;
  assignedTo: string;
  completed: boolean;
  dueDate: string;
  priority: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
console.log("API_BASE_URL:", API_BASE_URL);

export default function AddTask({ tripId, users }: AddTaskProps) {
  const router = useRouter();
  const { getToken } = useAuth();
  console.log(users);
  const demoUsers =
    users?.length > 0
      ? users
      : [];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<FormData>({
    text: "",
    assignedTo: "",
    completed: false,
    dueDate: "",
    priority: "medium",
  });

  const resetForm = useCallback(() => {
    setFormData({
      text: "",
      assignedTo: "",
      completed: false,
      dueDate: "",
      priority: "medium",
    });
    setError(null);
    setSuccess(false);
  }, []);

  const handleInputChange = useCallback(
    <K extends keyof FormData>(field: K, value: FormData[K]) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      if (error) setError(null);
    },
    [error],
  );

  const validateForm = useCallback(() => {
    if (!formData.text.trim()) {
      setError("Task description is required");
      return false;
    }
    if (!formData.assignedTo) {
      setError("Please select someone to assign this task to");
      return false;
    }
    return true;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      setIsSubmitting(true);
      setError(null);

      try {
        const token = await getToken();
        const requestBody = {
          text: formData.text.trim(),
          assignedTo: formData.assignedTo,
          completed: formData.completed,
        };

        const response = await fetch(
          `${API_BASE_URL}/api/trips/${tripId}/tasks`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            credentials: "include",
            body: JSON.stringify(requestBody),
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(
            errorData?.message || `Failed to create task (${response.status})`,
          );
        }

        // Show success state
        setSuccess(true);
        router.push(`/tasks/${tripId}`);
      } catch (err) {
        console.error("Error creating task:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create task. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, tripId, validateForm, router],
  );

  const getInitials = useCallback((name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }, []);

  const getPriorityConfig = useCallback((priority: string) => {
    switch (priority) {
      case "high":
        return {
          color: "bg-red-50 text-red-700 border-red-200 ring-red-100",
          icon: "🔴",
          label: "High",
        };
      case "medium":
        return {
          color: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-100",
          icon: "🟡",
          label: "Medium",
        };
      case "low":
        return {
          color: "bg-green-50 text-green-700 border-green-200 ring-green-100",
          icon: "🟢",
          label: "Low",
        };
      default:
        return {
          color: "bg-gray-50 text-gray-700 border-gray-200 ring-gray-100",
          icon: "⚪",
          label: "Medium",
        };
    }
  }, []);

  const selectedUser = demoUsers.find((u) => u._id === formData.assignedTo);
  const priorityConfig = getPriorityConfig(formData.priority);

  return (
    <div className="space-y-4 bg-gray-50">
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="rounded-full"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>{" "}
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg overflow-hidden border border-gray-100 backdrop-blur-sm">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-500 rounded-xl shadow-sm">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add New Task
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  Create and assign a task for your trip
                </p>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-indigo-100/40 to-transparent rounded-full translate-y-10 -translate-x-10"></div>
          </div>

          {/* Content */}
          <div className="p-6">
            {success ? (
              <div className="text-center py-12">
                <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 mb-6 shadow-sm">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Task Created Successfully!
                </h3>
                <p className="text-gray-600 max-w-sm mx-auto leading-relaxed">
                  Your task has been added to the trip and assigned to the
                  selected team member.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Task Description */}
                <div className="space-y-2">
                  <label
                    htmlFor="taskText"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Task Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="taskText"
                      value={formData.text}
                      onChange={(e) =>
                        handleInputChange("text", e.target.value)
                      }
                      placeholder="What needs to be done? Be specific..."
                      rows={3}
                      className={`w-full px-4 py-3 border-2 rounded-xl transition-all duration-200 resize-none text-gray-800 placeholder-gray-400 ${
                        formData.text.trim()
                          ? "border-green-200 bg-green-50/30 focus:border-green-400 focus:ring-4 focus:ring-green-100"
                          : "border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 hover:border-gray-300"
                      }`}
                      disabled={isSubmitting}
                    />
                    <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                      {formData.text.length}/500
                    </div>
                  </div>
                </div>

                {/* Assign To */}
                <div className="space-y-2">
                  <label
                    htmlFor="assignedTo"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Assign To <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    <select
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={(e) =>
                        handleInputChange("assignedTo", e.target.value)
                      }
                      className={`w-full pl-10 pr-10 py-3 border-2 rounded-xl transition-all duration-200 appearance-none font-medium ${
                        formData.assignedTo
                          ? "border-green-200 bg-green-50/30 focus:border-green-400 focus:ring-4 focus:ring-green-100 text-gray-800"
                          : "border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 text-gray-500"
                      }`}
                      disabled={isSubmitting}
                    >
                      <option value="">Choose team member...</option>
                      {demoUsers.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedUser && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg transition-all duration-300">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                          <span className="text-xs font-bold text-white">
                            {getInitials(selectedUser.name)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {selectedUser.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {selectedUser.email}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Priority & Due Date Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Priority */}
                  <div className="space-y-2">
                    <label
                      htmlFor="priority"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Priority
                    </label>
                    <div className="relative">
                      <Flag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <select
                        id="priority"
                        value={formData.priority}
                        onChange={(e) =>
                          handleInputChange("priority", e.target.value)
                        }
                        className="w-full pl-10 pr-8 py-3 border-2 border-gray-200 bg-gray-50/50 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 transition-all duration-200 appearance-none font-medium text-gray-800"
                        disabled={isSubmitting}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${priorityConfig.color}`}
                      >
                        <span>{priorityConfig.icon}</span>
                        {priorityConfig.label}
                      </span>
                    </div>
                  </div>

                  {/* Due Date */}
                  <div className="space-y-2">
                    <label
                      htmlFor="dueDate"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="date"
                        id="dueDate"
                        value={formData.dueDate}
                        onChange={(e) =>
                          handleInputChange("dueDate", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className={`w-full pl-10 pr-3 py-3 border-2 rounded-xl transition-all duration-200 font-medium ${
                          formData.dueDate
                            ? "border-green-200 bg-green-50/30 focus:border-green-400 focus:ring-4 focus:ring-green-100 text-gray-800"
                            : "border-gray-200 bg-gray-50/50 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 hover:border-gray-300 text-gray-500"
                        }`}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>

                {/* Mark as Completed Toggle */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div>
                    <label
                      htmlFor="completed"
                      className="text-sm font-semibold text-gray-800 cursor-pointer"
                    >
                      Mark as completed
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Task will be created in completed state
                    </p>
                  </div>
                  <label
                    htmlFor="completed"
                    className="relative inline-flex cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="completed"
                      checked={formData.completed}
                      onChange={(e) =>
                        handleInputChange("completed", e.target.checked)
                      }
                      className="sr-only peer"
                      disabled={isSubmitting}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">
                        Error
                      </h4>
                      <p className="text-sm text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 hover:border-gray-300 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed focus:ring-4 focus:ring-gray-100"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={
                      isSubmitting ||
                      !formData.text.trim() ||
                      !formData.assignedTo
                    }
                    className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl focus:ring-4 focus:ring-blue-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creating Task...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Task
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
