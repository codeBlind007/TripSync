"use client";
import { Plus, ChevronLeft } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface TasksListHeaderProps {
  completedCount: number;
  totalCount: number;
  completionPercentage: number;
  onAddTask: () => void;
  isCompleted?: boolean;
}

export function TasksListHeader({
  completedCount,
  totalCount,
  completionPercentage,
  onAddTask,
  isCompleted = false,
}: TasksListHeaderProps) {
  const router = useRouter();
  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        size="icon"
        asChild
        className="rounded-full"
        onClick={() => router.back()}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Trip Tasks</h2>
            <p className="text-sm text-gray-600 mt-1">
              {completedCount} of {totalCount} tasks completed
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {completionPercentage}%
              </div>
              <div className="text-sm text-gray-500">Complete</div>
            </div>
            {!isCompleted && (
              <button
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                onClick={onAddTask}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
