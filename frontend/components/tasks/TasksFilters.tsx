"use client";
import { Search } from "lucide-react";

interface Status {
  status: string;
}

interface TasksFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: Status;
  onFilterChange: (status: Status) => void;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

export function TasksFilters({
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterChange,
  filteredCount,
  totalCount,
  onClearFilters
}: TasksFiltersProps) {
  const hasActiveFilters = searchTerm || filterStatus.status !== "all";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks or assignees..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filterStatus.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
            className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      
      {hasActiveFilters && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} tasks
          </span>
          <button 
            onClick={onClearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium cusror-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}