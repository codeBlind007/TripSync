"use client";
import { useState} from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Circle, Save } from "lucide-react";
import { Tasks} from "./TasksList";

interface EditTaskPageProps {
  tasks: Tasks;
  tripId: string;
  availableAssignees: {
    _id: string;
    name: string;
  }[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function EditTaskPage({ 
  tasks, 
  tripId,
  availableAssignees
}: EditTaskPageProps) {
  const [taskText, setTaskText] = useState(tasks.text);
  const [selectedAssignee, setSelectedAssignee] = useState(tasks.assignedTo._id);
  const [isCompleted, setIsCompleted] = useState(tasks.completed);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  console.log("component called");
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!taskText.trim() || !selectedAssignee) return;

  setIsSubmitting(true);

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/trips/${tripId}/tasks/${tasks.taskId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          text: taskText.trim(),
          assignedTo: selectedAssignee,
          completed: isCompleted,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to update task");

    router.push(`/tasks/${tripId}`);
  } catch (error) {
    console.error("Error updating task:", error);
    setIsSubmitting(false);
  }
};


  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={handleCancel}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tasks
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Task</h1>
          <p className="text-gray-600 mt-2">Update task details and assignment</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Task Description */}
            <div>
              <label htmlFor="taskText" className="block text-sm font-semibold text-gray-700 mb-2">
                Task Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="taskText"
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900"
                placeholder="Enter task description..."
                required
              />
              <p className="mt-2 text-sm text-gray-500">
                Provide a clear description of what needs to be done
              </p>
            </div>

            {/* Assignee Selection */}
            <div>
              <label htmlFor="assignee" className="block text-sm font-semibold text-gray-700 mb-2">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <select
                id="assignee"
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                required
              >
                <option value="">Select assignee</option>
                {availableAssignees.map((assignee) => (
                  <option key={assignee._id} value={assignee._id}>
                    {assignee.name}
                  </option>
                ))}
              </select>
              <p className="mt-2 text-sm text-gray-500">
                Choose who will be responsible for this task
              </p>
            </div>

            {/* Completion Status */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Task Status
              </label>
              <div className="space-y-3">
                {/* Pending Option */}
                <button
                  type="button"
                  onClick={() => setIsCompleted(false)}
                  className={`flex items-center gap-3 w-full px-4 py-4 border-2 rounded-lg transition-all cursor-pointer ${
                    !isCompleted
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <Circle className={`h-5 w-5 ${!isCompleted ? "text-blue-600" : "text-gray-400"}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${!isCompleted ? "text-blue-900" : "text-gray-700"}`}>
                      Pending
                    </div>
                    <div className="text-sm text-gray-500">
                      Task is still in progress
                    </div>
                  </div>
                </button>

                {/* Completed Option */}
                <button
                  type="button"
                  onClick={() => setIsCompleted(true)}
                  className={`flex items-center gap-3 w-full px-4 py-4 border-2 rounded-lg transition-all cursor-pointer${
                    isCompleted
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 bg-white hover:border-gray-400"
                  }`}
                >
                  <CheckCircle2 className={`h-5 w-5 ${isCompleted ? "text-green-600" : "text-gray-400"}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${isCompleted ? "text-green-900" : "text-gray-700"}`}>
                      Completed
                    </div>
                    <div className="text-sm text-gray-500">
                      Task has been finished
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !taskText.trim() || !selectedAssignee}
                className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium text-sm">ℹ</span>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">Quick Tip</h3>
              <p className="text-sm text-blue-800">
                Make sure to assign tasks to the right team members and update the status as work progresses to keep everyone informed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}