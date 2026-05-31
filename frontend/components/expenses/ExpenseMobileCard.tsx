"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users } from "lucide-react";
import { format } from "date-fns";

import { ExpenseDetailsPanel } from "./ExpenseDetailsPanel";
import { formatAmount } from "@/lib/currencyConfig";
import {
  getExpensePayers,
  getExpenseParticipants,
  getUserInitials,
} from "@/lib/expenseDisplay";
import { getCategoryLabel } from "@/lib/expenseUtils";
import { Expense } from "@/types";

interface ExpenseMobileCardProps {
  expense: Expense;
  getCategoryBadgeVariant: (
    category: string,
  ) => "default" | "secondary" | "destructive" | "outline";
  getCategoryIcon: (category: string) => string;
}

function formatDate(dateString: string) {
  return format(new Date(dateString), "PP");
}

function PayerPreview({ expense }: { expense: Expense }) {
  const payers = getExpensePayers(expense);

  if (payers.length === 0) {
    return <span className="text-sm text-gray-500">No payers</span>;
  }

  if (payers.length === 1) {
    const payer = payers[0];

    return (
      <div className="flex items-center gap-2">
        <Avatar className="h-7 w-7">
          <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
            {getUserInitials(payer.user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium text-gray-900">{payer.user.name}</p>
          <p className="text-xs text-gray-500">
            Paid {formatAmount(payer.amount)}
          </p>
        </div>
      </div>
    );
  }

  const visible = payers.slice(0, 2);
  const remaining = payers.length - visible.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center gap-2 text-left">
          <div className="flex -space-x-2">
            {visible.map((payer) => (
              <Avatar
                key={payer.user._id || payer.user.email || payer.user.name}
                className="h-7 w-7 border-2 border-white"
              >
                <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                  {getUserInitials(payer.user.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            {remaining > 0 && (
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-500 text-[10px] font-semibold text-white">
                +{remaining}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {visible
                .map((payer) => getUserInitials(payer.user.name))
                .join(" ")}
              {remaining > 0 ? ` +${remaining}` : ""}
            </p>
            <p className="text-xs text-gray-500">Tap for payers</p>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Paid By</p>
          {payers.map((payer) => (
            <div
              key={payer.user._id || payer.user.email || payer.user.name}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                    {getUserInitials(payer.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm font-medium text-gray-900">
                  {payer.user.name}
                </span>
              </div>
              <span className="shrink-0 text-sm text-gray-600">
                {formatAmount(payer.amount)}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ExpenseMobileCard({
  expense,
  getCategoryBadgeVariant,
  getCategoryIcon,
}: ExpenseMobileCardProps) {
  const participants = getExpenseParticipants(expense);
  const title = expense.title?.trim() || expense.note || "Untitled expense";
  const secondaryLine =
    expense.note?.trim() && expense.note.trim() !== title ? expense.note : "";

  return (
    <Card className="border-l-4 border-l-blue-500 p-4 transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-start gap-2 text-2xl">
            <span>{getCategoryIcon(expense.category)}</span>
            <div className="min-w-0">
              <h4 className="truncate font-semibold text-gray-900">{title}</h4>
              {secondaryLine && (
                <p className="truncate text-sm text-gray-600">
                  {secondaryLine}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-3 w-3 text-gray-400" />
            <span>{formatDate(expense.date)}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatAmount(expense.totalAmount)}
          </p>
          <Badge
            variant={getCategoryBadgeVariant(expense.category)}
            className="mt-1"
          >
            {getCategoryLabel(expense.category)}
          </Badge>
        </div>
      </div>

      <Separator className="my-3" />

      <div className="space-y-3">
        <div className="space-y-2 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Payers
          </p>
          <PayerPreview expense={expense} />
        </div>

        <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="h-4 w-4 text-gray-500" />
            <span>
              {participants.length}{" "}
              {participants.length === 1 ? "Participant" : "Participants"}
            </span>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-sm font-medium text-blue-600"
              >
                View split
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(92vw,22rem)] p-3" align="start">
              <ExpenseDetailsPanel expense={expense} compact />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </Card>
  );
}
