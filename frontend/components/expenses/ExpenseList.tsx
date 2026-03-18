"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCaption,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Receipt } from "lucide-react";

// Import sub-components
import { ExpenseSummaryCards } from "./ExpenseSummaryCards";
import { ExpenseFilters } from "./ExpenseFilters";
import { ExpenseTableRow } from "./ExpenseTableRow";
import { ExpenseMobileCard } from "./ExpenseMobileCard";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { getCategoryBadgeVariant, getCategoryIcon } from "@/lib/expenseUtils";
import { formatAmount } from "@/lib/currencyConfig";

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Expense {
  _id: string;
  amount: number;
  category: string;
  spentBy: User;
  sharedWith: User[];
  note: string;
  date: string;
}

interface PageProps {
  tripId: string;
  initialExpenses: Expense[];
  isCompleted: boolean;
}

export default function ExpenseList({
  tripId,
  initialExpenses,
  isCompleted,
}: PageProps) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const router = useRouter();

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      const data = await res.json();
      setExpenses(data.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort expenses
  const filteredAndSortedExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const matchesSearch =
          expense.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
          expense.spentBy.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" ||
          expense.category.toLowerCase() === categoryFilter.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return new Date(b.date).getTime() - new Date(a.date).getTime();
          case "date-asc":
            return new Date(a.date).getTime() - new Date(b.date).getTime();
          case "amount-desc":
            return b.amount - a.amount;
          case "amount-asc":
            return a.amount - b.amount;
          default:
            return 0;
        }
      });
  }, [expenses, searchTerm, categoryFilter, sortBy]);

  // Calculate summary stats
  const { totalAmount, uniqueCategories, averageExpense } = useMemo(() => {
    const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const unique = [...new Set(expenses.map((e) => e.category))];
    const average = expenses.length > 0 ? total / expenses.length : 0;
    return {
      totalAmount: total,
      uniqueCategories: unique,
      averageExpense: average,
    };
  }, [expenses]);

  const handleAddExpense = () => {
    router.push(`/expenses/add-expenses/${tripId}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
  };

  if (error) {
    return <ErrorState error={error} onRetry={fetchExpenses} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Summary Cards */}
      {!loading && expenses.length > 0 && (
        <ExpenseSummaryCards
          totalAmount={totalAmount}
          expenseCount={expenses.length}
          averageExpense={averageExpense}
        />
      )}

      {/* Main Expenses Card */}
      <Card className="w-full">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Trip Expenses
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Track and manage all your travel expenses
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              {!isCompleted && (
                <Button
                  size="sm"
                  onClick={handleAddExpense}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Expense
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Filters and Search */}
          {!loading && expenses.length > 0 && (
            <ExpenseFilters
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              uniqueCategories={uniqueCategories}
              filteredCount={filteredAndSortedExpenses.length}
              totalCount={expenses.length}
              getCategoryIcon={getCategoryIcon}
            />
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : filteredAndSortedExpenses.length === 0 ? (
            <EmptyState
              hasExpenses={expenses.length > 0}
              onAddExpense={handleAddExpense}
              onClearFilters={handleClearFilters}
              isCompleted={isCompleted}
            />
          ) : (
            <div className="space-y-4">
              {/* Mobile-friendly cards for small screens */}
              <div className="block md:hidden space-y-3">
                {filteredAndSortedExpenses.map((expense) => (
                  <ExpenseMobileCard
                    key={expense._id}
                    expense={expense}
                    getCategoryBadgeVariant={getCategoryBadgeVariant}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>

              {/* Desktop table */}
              <div className="hidden md:block">
                <Table>
                  <TableCaption className="text-left text-gray-600 mb-4">
                    {filteredAndSortedExpenses.length} expense
                    {filteredAndSortedExpenses.length !== 1 ? "s" : ""}• Total:{" "}
                    {formatAmount(totalAmount)}
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">
                        Description
                      </TableHead>
                      <TableHead className="font-semibold">Paid by</TableHead>
                      <TableHead className="font-semibold">
                        Shared with
                      </TableHead>
                      <TableHead className="text-right font-semibold">
                        Amount
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedExpenses.map((expense, index) => (
                      <ExpenseTableRow
                        key={expense._id}
                        expense={expense}
                        index={index}
                        getCategoryBadgeVariant={getCategoryBadgeVariant}
                        getCategoryIcon={getCategoryIcon}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
