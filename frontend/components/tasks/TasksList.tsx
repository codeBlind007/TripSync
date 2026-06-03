"use client";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { TasksListHeader } from "./TasksListHeader";
import { TaskItem } from "./TaskItem";
import { EmptyTasksState } from "./EmptyStates";

export interface AssignedTo {
  _id: string;
  name: string;
}

export interface Tasks {
  taskId: string;
  text: string;
  assignedTo: AssignedTo;
  completed: boolean;
  _id: string;
}

interface TasksListProps {
  tasks: Tasks[] | null;
  tripId: string;
  availableAssignees?: AssignedTo[];
  isCompleted: boolean;
}

export function TasksList({ tasks, tripId, isCompleted }: TasksListProps) {
  const router = useRouter();

  // Marking removed: no toggle handler (no marking/unmarking or backend requests)

  const handleAddTask = useCallback(() => {
    router.push(`/add-tasks/${tripId}`);
  }, [router, tripId]);

  const taskArray = tasks ?? [];
  const totalCount = taskArray.length;
  const completedCount = taskArray.filter((t) => t.completed).length;
  const completionPercentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <TasksListHeader
        completedCount={completedCount}
        totalCount={totalCount}
        completionPercentage={completionPercentage}
        onAddTask={handleAddTask}
        isCompleted={isCompleted}
      />

      {/* Tasks List */}
      <div className="space-y-3">
        {taskArray.map((task) => (
          <div key={task._id}>
            <TaskItem task={task} tripId={tripId} isCompleted={isCompleted} />
          </div>
        ))}
      </div>

      {taskArray.length === 0 && (
        <EmptyTasksState
          onCreateTask={handleAddTask}
          isCompleted={isCompleted}
        />
      )}
    </div>
  );
}
