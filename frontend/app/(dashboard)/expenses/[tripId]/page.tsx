import { getExpenses } from "@/lib/api";
import ExpenseList from "@/components/expenses/ExpenseList";
import { Expense } from "@/types";

interface expenseProps {
  params: Promise<{
    tripId: string;
  }>;
  searchParams: Promise<{
    isCompleted?: string;
  }>;
}

export default async function ExpensePage({
  params,
  searchParams,
}: expenseProps) {
  const paramsAwaited = await params;
  const awaitedSearchParams = await searchParams;
  const expenses: Expense[] = await getExpenses(paramsAwaited.tripId);
  const isCompleted = awaitedSearchParams.isCompleted === "true";
  return (
    <ExpenseList
      tripId={paramsAwaited.tripId}
      initialExpenses={expenses || []}
      isCompleted={isCompleted}
    />
  );
}
