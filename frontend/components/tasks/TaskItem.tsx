"use client";
import { CheckCircle2, Circle, Edit3, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface AssignedTo {
  _id: string;
  name: string;
}

interface Task {
  taskId: string;
  text: string;
  assignedTo: AssignedTo;
  completed: boolean;
  _id: string;
}

interface TaskItemProps {
  task: Task;
  tripId: string;
  onToggleComplete: (taskId: string) => void;
  isCompleted?: boolean;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export function TaskItem({
  task,
  tripId,
  onToggleComplete,
  isCompleted = false,
}: TaskItemProps) {
  const router = useRouter();
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/trips/${tripId}/tasks/${task.taskId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="p-5">
      <div className="flex items-start gap-4">
        {/* Checkbox */}
        <button
          onClick={() => !isCompleted && onToggleComplete(task._id)}
          disabled={isCompleted}
          className={`flex-shrink-0 mt-0.5 transition-colors cursor-pointer ${
            task.completed
              ? "text-green-600 hover:text-green-700"
              : "text-gray-400 hover:text-gray-600"
          } ${isCompleted ? "cursor-not-allowed opacity-60" : ""}`}
          aria-label={
            task.completed ? "Mark as incomplete" : "Mark as complete"
          }
        >
          {task.completed ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3
                className={`font-medium leading-6 ${
                  task.completed
                    ? "line-through text-gray-500"
                    : "text-gray-900"
                }`}
              >
                {task.text}
              </h3>

              <div className="flex items-center gap-4 mt-3">
                {/* Assignee */}
                <div className="flex items-center gap-2">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-700">
                      {getInitials(task.assignedTo.name)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {task.assignedTo.name}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {!isCompleted && (
              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={() =>
                    router.push(`/edit-tasks/${tripId}/task/${task.taskId}`)
                  }
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                  aria-label={`Edit task: ${task.text}`}
                >
                  <Edit3 className="h-4 w-4" />
                </button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      aria-label={`Delete task: ${task.text}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete task?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete &quot;{task.text}&quot;.
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        className="bg-destructive text-white hover:bg-destructive/90 cursor-pointer"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
