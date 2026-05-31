import { Expense, Participant, Payment, User } from "@/types";

export interface ExpenseAmountEntry {
  user: User;
  amount: number;
}

const getEntryKey = (user: User) => user._id || user.email || user.name;

const getParticipantAmount = (participant: Participant) => {
  return participant.shareAmount ?? participant.sharedAmount ?? 0;
};

const groupEntriesByUser = <T extends { user: User }>(
  entries: T[],
  getAmount: (entry: T) => number,
): ExpenseAmountEntry[] => {
  const grouped = new Map<string, ExpenseAmountEntry>();

  entries.forEach((entry) => {
    const key = getEntryKey(entry.user);
    const current = grouped.get(key);
    const amount = getAmount(entry);

    if (current) {
      current.amount += amount;
      return;
    }

    grouped.set(key, {
      user: entry.user,
      amount,
    });
  });

  return Array.from(grouped.values());
};

export const getExpensePayers = (expense: Expense): ExpenseAmountEntry[] => {
  return groupEntriesByUser(
    expense.payments ?? [],
    (payment: Payment) => payment.paidAmount,
  );
};

export const getExpenseParticipants = (
  expense: Expense,
): ExpenseAmountEntry[] => {
  return groupEntriesByUser(
    expense.participants ?? [],
    (participant: Participant) => getParticipantAmount(participant),
  );
};

export const getExpenseSettlementSummary = (
  expense: Expense,
): ExpenseAmountEntry[] => {
  const balances = new Map<string, ExpenseAmountEntry>();

  getExpensePayers(expense).forEach((entry) => {
    const key = getEntryKey(entry.user);
    const current = balances.get(key);

    if (current) {
      current.amount += entry.amount;
      return;
    }

    balances.set(key, {
      user: entry.user,
      amount: entry.amount,
    });
  });

  getExpenseParticipants(expense).forEach((entry) => {
    const key = getEntryKey(entry.user);
    const current = balances.get(key);

    if (current) {
      current.amount -= entry.amount;
      return;
    }

    balances.set(key, {
      user: entry.user,
      amount: -entry.amount,
    });
  });

  return Array.from(balances.values()).filter(
    (entry) => Math.abs(entry.amount) > 0.005,
  );
};

export const getExpenseSearchText = (expense: Expense): string => {
  const payerNames = getExpensePayers(expense).map((entry) => entry.user.name);
  const participantNames = getExpenseParticipants(expense).map(
    (entry) => entry.user.name,
  );

  return [
    expense.title,
    expense.note,
    expense.category,
    expense.createdBy?.name,
    ...payerNames,
    ...participantNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
};

export const getUserInitials = (name: string) => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};
