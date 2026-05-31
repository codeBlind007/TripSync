"use client";

import { useMemo, useState } from "react";
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

import { ExpenseSummaryCards } from "./ExpenseSummaryCards";
import { ExpenseFilters } from "./ExpenseFilters";
import { ExpenseTableRow } from "@/components/expenses/ExpenseTableRow";
import { ExpenseMobileCard } from "@/components/expenses/ExpenseMobileCard";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { getCategoryBadgeVariant, getCategoryIcon } from "@/lib/expenseUtils";
import { formatAmount } from "@/lib/currencyConfig";
import {
  getExpenseParticipants,
  getExpenseSearchText,
} from "@/lib/expenseDisplay";
import { Expense } from "@/types";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(
    null,
  );
  const router = useRouter();

  const fetchExpenses = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/trips/${tripId}/expenses`);

      if (!res.ok) {
        throw new Error("Failed to fetch expenses");
      }

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

  const filteredAndSortedExpenses = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim();

    return expenses
      .filter((expense) => {
        const matchesSearch =
          normalizedSearch.length === 0 ||
          getExpenseSearchText(expense).includes(normalizedSearch);
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
            return b.totalAmount - a.totalAmount;
          case "amount-asc":
            return a.totalAmount - b.totalAmount;
          default:
            return 0;
        }
      });
  }, [expenses, searchTerm, categoryFilter, sortBy]);

  const { totalAmount, uniqueCategories, averageExpense } = useMemo(() => {
    const total = expenses.reduce(
      (sum, expense) => sum + expense.totalAmount,
      0,
    );
    const unique = [...new Set(expenses.map((expense) => expense.category))];
    const average = expenses.length > 0 ? total / expenses.length : 0;

    return {
      totalAmount: total,
      uniqueCategories: unique,
      averageExpense: average,
    };
  }, [expenses]);

  const { displayedTotalAmount, displayedParticipantCount } = useMemo(() => {
    const total = filteredAndSortedExpenses.reduce(
      (sum, expense) => sum + expense.totalAmount,
      0,
    );
    const participantIds = new Set<string>();

    filteredAndSortedExpenses.forEach((expense) => {
      getExpenseParticipants(expense).forEach((participant) => {
        participantIds.add(
          participant.user._id ||
            participant.user.email ||
            participant.user.name,
        );
      });
    });

    return {
      displayedTotalAmount: total,
      displayedParticipantCount: participantIds.size,
    };
  }, [filteredAndSortedExpenses]);

  const handleAddExpense = () => {
    router.push(`/expenses/add-expenses/${tripId}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter("all");
  };

  const handleToggleExpense = (expenseId: string) => {
    setExpandedExpenseId((current) =>
      current === expenseId ? null : expenseId,
    );
  };

  if (error) {
    return <ErrorState error={error} onRetry={fetchExpenses} />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {!loading && expenses.length > 0 && (
        <ExpenseSummaryCards
          totalAmount={totalAmount}
          expenseCount={expenses.length}
          averageExpense={averageExpense}
        />
      )}

      <Card className="w-full">
        <CardHeader className="border-b bg-gray-50/50">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Receipt className="h-5 w-5" />
                Trip Expenses
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Track and manage all your travel expenses
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              {!isCompleted && (
                <Button
                  size="sm"
                  onClick={handleAddExpense}
                  className="cursor-pointer gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="h-4 w-4" />
                  Add Expense
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
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
              <div className="block space-y-3 md:hidden">
                {filteredAndSortedExpenses.map((expense) => (
                  <ExpenseMobileCard
                    key={expense._id}
                    expense={expense}
                    getCategoryBadgeVariant={getCategoryBadgeVariant}
                    getCategoryIcon={getCategoryIcon}
                  />
                ))}
              </div>

              <div className="hidden md:block">
                <Table>
                  <TableCaption className="text-left text-gray-600 mb-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-gray-900">
                        {filteredAndSortedExpenses.length} Expenses
                      </span>
                      <span>
                        Total Spend: {formatAmount(displayedTotalAmount)}
                      </span>
                      <span>{displayedParticipantCount} Participants</span>
                    </div>
                  </TableCaption>
                  <TableHeader>
                    <TableRow className="bg-gray-50/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Expense</TableHead>
                      <TableHead className="font-semibold">Category</TableHead>
                      <TableHead className="font-semibold">Payers</TableHead>
                      <TableHead className="font-semibold">
                        Participants
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
                        isExpanded={expandedExpenseId === expense._id}
                        onToggleDetails={handleToggleExpense}
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
