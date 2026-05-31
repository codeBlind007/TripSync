"use client";

import { useMemo } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TableCell, TableRow } from "@/components/ui/table";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
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

interface ExpenseTableRowProps {
  expense: Expense;
  index: number;
  isExpanded: boolean;
  onToggleDetails: (expenseId: string) => void;
  getCategoryBadgeVariant: (
    category: string,
  ) => "default" | "secondary" | "destructive" | "outline";
  getCategoryIcon: (category: string) => string;
}

function formatDate(dateString: string) {
  return format(new Date(dateString), "PP");
}

function PayerSummary({
  payers,
}: {
  payers: ReturnType<typeof getExpensePayers>;
}) {
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
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {payer.user.name}
          </p>
          <p className="text-xs text-gray-500">
            Paid {formatAmount(payer.amount)}
          </p>
        </div>
      </div>
    );
  }

  if (payers.length === 2) {
    return (
      <div className="space-y-1">
        {payers.map((payer) => (
          <div
            key={payer.user._id || payer.user.email || payer.user.name}
            className="flex items-center gap-2 text-sm"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                {getUserInitials(payer.user.name)}
              </AvatarFallback>
            </Avatar>
            <span className="truncate font-medium text-gray-900">
              {payer.user.name} {formatAmount(payer.amount)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  const visiblePayers = payers.slice(0, 2);
  const remainingCount = payers.length - visiblePayers.length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 text-left transition-opacity hover:opacity-80"
        >
          <div className="flex -space-x-2">
            {visiblePayers.map((payer) => (
              <Avatar
                key={payer.user._id || payer.user.email || payer.user.name}
                className="h-7 w-7 border-2 border-white"
              >
                <AvatarFallback className="bg-blue-100 text-xs font-semibold text-blue-700">
                  {getUserInitials(payer.user.name)}
                </AvatarFallback>
              </Avatar>
            ))}
            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-500 text-[10px] font-semibold text-white">
              +{remainingCount}
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-gray-900">
              {visiblePayers
                .map((payer) => getUserInitials(payer.user.name))
                .join(" ")}{" "}
              +{remainingCount}
            </p>
            <p className="text-xs text-gray-500">Click for full payer list</p>
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="start">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-900">Paid By</p>
          <div className="space-y-2">
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
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function ExpenseTableRow({
  expense,
  index,
  isExpanded,
  onToggleDetails,
  getCategoryBadgeVariant,
  getCategoryIcon,
}: ExpenseTableRowProps) {
  const payers = useMemo(() => getExpensePayers(expense), [expense]);
  const participants = useMemo(
    () => getExpenseParticipants(expense),
    [expense],
  );

  const primaryTitle =
    expense.title?.trim() || expense.note || "Untitled expense";
  const secondaryLine =
    expense.note?.trim() && expense.note.trim() !== primaryTitle
      ? expense.note
      : "";

  return (
    <>
      <TableRow
        className={`transition-colors hover:bg-gray-50/50 ${
          index % 2 === 0 ? "bg-white" : "bg-gray-25"
        }`}
      >
        <TableCell className="align-top font-medium">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            {formatDate(expense.date)}
          </div>
        </TableCell>

        <TableCell className="align-top">
          <div className="max-w-xs space-y-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium text-gray-900">
                  {primaryTitle}
                </p>
                {secondaryLine && (
                  <p
                    className="truncate text-xs text-gray-500"
                    title={expense.note}
                  >
                    {secondaryLine}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onToggleDetails(expense._id)}
                className="h-8 w-8 shrink-0 cursor-pointer"
                aria-label={
                  isExpanded
                    ? "Collapse expense details"
                    : "Expand expense details"
                }
              >
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </TableCell>

        <TableCell className="align-top">
          <Badge
            variant={getCategoryBadgeVariant(expense.category)}
            className="gap-1"
          >
            <span>{getCategoryIcon(expense.category)}</span>
            {getCategoryLabel(expense.category)}
          </Badge>
        </TableCell>

        <TableCell className="align-top">
          <PayerSummary payers={payers} />
        </TableCell>

        <TableCell className="align-top">
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="text-left transition-opacity hover:opacity-80"
              >
                <p className="text-sm font-medium text-gray-900">
                  {participants.length}{" "}
                  {participants.length === 1 ? "Participant" : "Participants"}
                </p>
                <p className="text-xs text-gray-500">View split</p>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <ExpenseDetailsPanel expense={expense} compact />
            </PopoverContent>
          </Popover>
        </TableCell>

        <TableCell className="align-top text-right">
          <div className="space-y-1">
            <p className="text-lg font-bold text-gray-900">
              {formatAmount(expense.totalAmount)}
            </p>
            <p className="text-xs text-gray-500">
              {payers.length} {payers.length === 1 ? "payer" : "payers"}
            </p>
          </div>
        </TableCell>
      </TableRow>

      {isExpanded && (
        <TableRow className="bg-gray-50/60">
          <TableCell colSpan={6} className="border-t px-6 py-4">
            <ExpenseDetailsPanel expense={expense} />
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
