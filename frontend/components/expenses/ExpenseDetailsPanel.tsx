"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatAmount } from "@/lib/currencyConfig";
import {
  getExpenseParticipants,
  getExpensePayers,
  getExpenseSettlementSummary,
  getUserInitials,
} from "@/lib/expenseDisplay";
import { Expense } from "@/types";

interface ExpenseDetailsPanelProps {
  expense: Expense;
  compact?: boolean;
}

export function ExpenseDetailsPanel({
  expense,
  compact = false,
}: ExpenseDetailsPanelProps) {
  const payers = getExpensePayers(expense);
  const participants = getExpenseParticipants(expense);
  const settlementSummary = getExpenseSettlementSummary(expense);

  const sectionSpacing = compact ? "space-y-2" : "space-y-3";
  const rowPadding = compact ? "p-1.5" : "p-2";

  return (
    <div className={compact ? "space-y-4" : "space-y-5"}>
      <div className={sectionSpacing}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Paid By
          </p>
        </div>
        <div className="space-y-2">
          {payers.map((entry) => (
            <div
              key={entry.user._id || entry.user.email || entry.user.name}
              className={`flex items-center justify-between rounded-lg border border-gray-100 ${rowPadding}`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className={compact ? "h-7 w-7" : "h-8 w-8"}>
                  <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                    {getUserInitials(entry.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium text-gray-900">
                  {entry.user.name}
                </span>
              </div>
              <Badge variant="outline" className="shrink-0">
                {formatAmount(entry.amount)}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className={sectionSpacing}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Split Between
          </p>
        </div>
        <div className="space-y-2">
          {participants.map((entry) => (
            <div
              key={entry.user._id || entry.user.email || entry.user.name}
              className={`flex items-center justify-between rounded-lg border border-gray-100 ${rowPadding}`}
            >
              <span className="truncate text-sm font-medium text-gray-900">
                {entry.user.name}
              </span>
              <span className="shrink-0 text-sm text-gray-600">
                {formatAmount(entry.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className={sectionSpacing}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Settlement Summary
          </p>
        </div>
        <div className="space-y-2">
          {settlementSummary.length > 0 ? (
            settlementSummary.map((entry) => {
              const isPositive = entry.amount > 0;

              return (
                <div
                  key={entry.user._id || entry.user.email || entry.user.name}
                  className={`flex items-center justify-between rounded-lg ${
                    isPositive ? "bg-green-50" : "bg-amber-50"
                  } ${rowPadding}`}
                >
                  <span className="truncate text-sm font-medium text-gray-900">
                    {entry.user.name}
                  </span>
                  <span
                    className={`text-sm font-semibold ${isPositive ? "text-green-700" : "text-amber-700"}`}
                  >
                    {isPositive
                      ? `gets back ${formatAmount(entry.amount)}`
                      : `owes ${formatAmount(Math.abs(entry.amount))}`}
                  </span>
                </div>
              );
            })
          ) : (
            <div
              className={`rounded-lg bg-gray-50 ${rowPadding} text-sm text-gray-600`}
            >
              Settled
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
