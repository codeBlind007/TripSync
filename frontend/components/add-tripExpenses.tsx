"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  IndianRupee,
  Receipt,
  Users,
  ArrowLeft,
  Check,
  Loader2,
  Tag,
  FileText,
  AlertCircle,
  SplitSquareHorizontal,
  Wallet,
  Calendar,
} from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const expenseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  totalAmount: z.number().positive("Amount must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  note: z.string().max(500, "Note must not exceed 500 characters").optional(),
  date: z.string().optional(),
  splitType: z.enum(["equal", "unequal"]),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
type SplitType = "equal" | "unequal";
type MoneyMap = Record<string, number>;

interface ExpenseFormProps {
  tripId: string;
  currentUserId: string;
  collaborators: { _id: string; name: string }[];
}

const categories = [
  { value: "food", label: "Food", icon: "🍽️" },
  { value: "transport", label: "Transport", icon: "🚗" },
  { value: "stay", label: "Stay", icon: "🏨" },
  { value: "activities", label: "Activities", icon: "🎯" },
  { value: "shopping", label: "Shopping", icon: "🛍️" },
  { value: "miscellaneous", label: "Miscellaneous", icon: "💰" },
];

function roundToTwoDecimals(value: number) {
  return Math.round(value * 100) / 100;
}

function distributeAmount(totalAmount: number, memberIds: string[]) {
  if (memberIds.length === 0) return [];
  const totalCents = Math.round(totalAmount * 100);
  const baseCents = Math.floor(totalCents / memberIds.length);
  const remainder = totalCents % memberIds.length;
  return memberIds.map((memberId, index) => ({
    memberId,
    amount: (baseCents + (index < remainder ? 1 : 0)) / 100,
  }));
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatRupee(amount: number) {
  return `₹${amount.toFixed(2)}`;
}

function getTodayInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function MemberAvatar({
  name,
  size = "sm",
}: {
  name: string;
  size?: "xs" | "sm";
}) {
  const cls = size === "xs" ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs";
  return (
    <Avatar className={cls}>
      <AvatarFallback className="bg-gradient-to-br from-blue-100 to-purple-100 text-blue-700 font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

function ValidationPill({
  paid,
  total,
  valid,
}: {
  paid: number;
  total: number;
  valid: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border",
        valid
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-red-50 text-red-600 border-red-200",
      )}
    >
      {formatRupee(paid)} / {formatRupee(total)} {valid ? "✓" : "✗"}
    </span>
  );
}

function ColHeader({
  icon: Icon,
  label,
  color,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className={cn("h-4 w-4", color)} />
      <span className={cn("text-sm font-semibold", color)}>{label}</span>
    </div>
  );
}

export function ExpenseForm({
  tripId,
  currentUserId,
  collaborators,
}: ExpenseFormProps) {
  const router = useRouter();
  const { getToken } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [selectedPayers, setSelectedPayers] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    [],
  );
  const [payerAmounts, setPayerAmounts] = useState<MoneyMap>({});
  const [participantShares, setParticipantShares] = useState<MoneyMap>({});

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      title: "",
      totalAmount: undefined,
      category: "",
      note: "",
      date: getTodayInputValue(),
      splitType: "equal",
    },
  });

  const title = form.watch("title");
  const totalAmount = form.watch("totalAmount");
  const category = form.watch("category");
  const splitType = form.watch("splitType");

  const tripMembers = useMemo(() => {
    const members = [{ _id: currentUserId, name: "You" }, ...collaborators];
    const seen = new Set<string>();
    return members.filter((m) => {
      if (seen.has(m._id)) return false;
      seen.add(m._id);
      return true;
    });
  }, [collaborators, currentUserId]);

  const selectedPayerMembers = useMemo(
    () => tripMembers.filter((m) => selectedPayers.includes(m._id)),
    [selectedPayers, tripMembers],
  );

  const selectedParticipantMembers = useMemo(
    () => tripMembers.filter((m) => selectedParticipants.includes(m._id)),
    [selectedParticipants, tripMembers],
  );

  const equalPayerAmounts = useMemo(
    () => distributeAmount(totalAmount ?? 0, selectedPayers),
    [selectedPayers, totalAmount],
  );

  const equalParticipantShares = useMemo(
    () => distributeAmount(totalAmount ?? 0, selectedParticipants),
    [selectedParticipants, totalAmount],
  );

  const isSinglePayer = selectedPayers.length === 1;

  useEffect(() => {
    if (selectedPayers.length === 0) return;
    if (isSinglePayer) {
      setPayerAmounts({ [selectedPayers[0]]: totalAmount ?? 0 });
      return;
    }
    setPayerAmounts((cur) => {
      const next: MoneyMap = {};
      selectedPayers.forEach((id, i) => {
        next[id] = cur[id] ?? equalPayerAmounts[i]?.amount ?? 0;
      });
      return next;
    });
  }, [equalPayerAmounts, selectedPayers, totalAmount, isSinglePayer]);

  useEffect(() => {
    if (splitType !== "unequal") return;
    setParticipantShares((cur) => {
      const next: MoneyMap = {};
      selectedParticipants.forEach((id, i) => {
        next[id] = cur[id] ?? equalParticipantShares[i]?.amount ?? 0;
      });
      return next;
    });
  }, [equalParticipantShares, selectedParticipants, splitType, totalAmount]);

  const payerTotal = useMemo(
    () => selectedPayers.reduce((s, id) => s + (payerAmounts[id] ?? 0), 0),
    [payerAmounts, selectedPayers],
  );

  const participantTotal = useMemo(() => {
    if (splitType === "equal")
      return equalParticipantShares.reduce((s, x) => s + x.amount, 0);
    return selectedParticipants.reduce(
      (s, id) => s + (participantShares[id] ?? 0),
      0,
    );
  }, [
    equalParticipantShares,
    participantShares,
    selectedParticipants,
    splitType,
  ]);

  const isPaymentValid = useMemo(() => {
    if (!totalAmount || totalAmount <= 0 || selectedPayers.length === 0)
      return false;
    return Math.round(payerTotal * 100) === Math.round(totalAmount * 100);
  }, [payerTotal, selectedPayers.length, totalAmount]);

  const isParticipantValid = useMemo(() => {
    if (!totalAmount || totalAmount <= 0 || selectedParticipants.length === 0)
      return false;
    return Math.round(participantTotal * 100) === Math.round(totalAmount * 100);
  }, [participantTotal, selectedParticipants.length, totalAmount]);

  const canSubmit =
    !!title &&
    !!totalAmount &&
    totalAmount > 0 &&
    !!category &&
    selectedPayers.length > 0 &&
    selectedParticipants.length > 0 &&
    isPaymentValid &&
    isParticipantValid;

  async function onSubmit(data: ExpenseFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (!canSubmit)
        throw new Error(
          "Please make sure payer amounts and participant shares add up to the total amount.",
        );

      const token = await getToken();

      const payments = selectedPayers.map((id, i) => ({
        user: id,
        paidAmount: isSinglePayer
          ? (totalAmount ?? 0)
          : (payerAmounts[id] ?? equalPayerAmounts[i]?.amount ?? 0),
      }));

      const participants = selectedParticipants.map((id, i) => ({
        user: id,
        shareAmount:
          splitType === "equal"
            ? (equalParticipantShares[i]?.amount ?? 0)
            : (participantShares[id] ?? 0),
      }));

      const payload = {
        title: data.title,
        totalAmount: data.totalAmount,
        category: data.category,
        payments,
        participants,
        note: data.note?.trim() || "",
        date: data.date,
      };

      const url = API_BASE_URL
        ? `${API_BASE_URL}/api/trips/${tripId}/expenses`
        : `/api/trips/${tripId}/expenses`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to add expense");

      toast.success("Expense added successfully! 🎉");
      form.reset({
        title: "",
        totalAmount: undefined,
        category: "",
        note: "",
        date: getTodayInputValue(),
        splitType: "equal",
      });
      setSelectedPayers([]);
      setSelectedParticipants([]);
      setPayerAmounts({});
      setParticipantShares({});
      router.replace(`/expenses/${tripId}`);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to add expense. Please try again.";
      setSubmitError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function togglePayer(id: string) {
    setSelectedPayers((cur) => {
      if (cur.includes(id)) {
        if (cur.length === 1) return cur;
        return cur.filter((x) => x !== id);
      }
      return [...cur, id];
    });
  }

  function toggleParticipant(id: string) {
    setSelectedParticipants((cur) => {
      if (cur.includes(id)) {
        if (cur.length === 1) return cur;
        return cur.filter((x) => x !== id);
      }
      return [...cur, id];
    });
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* ── Page header ── */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/expenses/${tripId}`)}
            className="gap-2 cursor-pointer shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Add New Expense
            </h1>
            <p className="text-sm text-gray-500">
              Track a new expense for your trip
            </p>
          </div>
        </div>

        {/* ── Error banner ── */}
        {submitError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700 flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div>
              <p className="font-medium text-sm">Could not add expense</p>
              <p className="text-xs text-red-600">{submitError}</p>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) =>
              console.log("Form errors:", e),
            )}
            className="space-y-5"
          >
            {/*
             * ════════════════════════════════════════════════════
             *  TWO-COLUMN GRID
             *  Left  (5/12): Expense Details
             *  Right (7/12): Participants + Split + Breakdown
             * ════════════════════════════════════════════════════
             */}
            <div className="grid grid-cols-1 lg:grid-cols-[5fr_7fr] gap-5 items-start">
              {/* ══ LEFT COLUMN ══════════════════════════════════ */}
              <div className="space-y-5">
                {/* SECTION 1 — Expense Details */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-0 pt-5 px-5">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-blue-500" />
                      Expense Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-4 space-y-4">
                    {/* Title */}
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                            <Receipt className="h-3 w-3" /> Title
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Dinner at BBQ Nation"
                              className="h-10 border-2 focus:border-blue-500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Amount + Category */}
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                              <IndianRupee className="h-3 w-3" /> Amount
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                  <IndianRupee className="h-3.5 w-3.5" />
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  placeholder="0.00"
                                  className="pl-8 h-10 text-base font-semibold border-2 focus:border-blue-500"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    field.onChange(
                                      v === "" ? undefined : parseFloat(v),
                                    );
                                  }}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                              <Tag className="h-3 w-3" /> Category
                            </FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <SelectTrigger className="h-10 border-2 focus:border-blue-500">
                                  <SelectValue placeholder="Select…" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                      <span className="flex items-center gap-2">
                                        <span>{c.icon}</span>
                                        <span>{c.label}</span>
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Note */}
                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                            <FileText className="h-3 w-3" /> Note{" "}
                            <span className="font-normal text-gray-400">
                              (optional)
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add any details about this expense"
                              className="resize-none h-20 border-2 focus:border-blue-500"
                              maxLength={500}
                              {...field}
                            />
                          </FormControl>
                          <FormDescription className="text-right text-xs text-gray-400">
                            {(field.value ?? "").length} / 500
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Date */}
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                            <Calendar className="h-3 w-3" /> Date
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              className="h-10 border-2 focus:border-blue-500"
                              value={field.value || getTodayInputValue()}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>

                {/* SECTION 3 — Split Type (placed under details on left) */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-0 pt-5 px-5">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <SplitSquareHorizontal className="h-4 w-4 text-emerald-500" />
                      Split Type
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-3">
                    <FormField
                      control={form.control}
                      name="splitType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex gap-3">
                              {(
                                [
                                  {
                                    value: "equal",
                                    label: "Equal Split",
                                    desc: "Auto divide evenly",
                                  },
                                  {
                                    value: "unequal",
                                    label: "Unequal Split",
                                    desc: "Set custom shares",
                                  },
                                ] as const
                              ).map((opt) => {
                                const active = field.value === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() =>
                                      form.setValue(
                                        "splitType",
                                        opt.value as SplitType,
                                      )
                                    }
                                    className={cn(
                                      "flex-1 flex items-start gap-2.5 rounded-xl border-2 px-4 py-3 text-left transition-all duration-150",
                                      active
                                        ? "border-emerald-500 bg-emerald-50/60"
                                        : "border-gray-200 bg-white hover:border-gray-300",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "mt-0.5 h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                                        active
                                          ? "border-emerald-600 bg-emerald-600"
                                          : "border-gray-300",
                                      )}
                                    >
                                      {active && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <div>
                                      <p
                                        className={cn(
                                          "text-sm font-semibold",
                                          active
                                            ? "text-emerald-900"
                                            : "text-gray-700",
                                        )}
                                      >
                                        {opt.label}
                                      </p>
                                      <p className="text-xs text-gray-400">
                                        {opt.desc}
                                      </p>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* ══ RIGHT COLUMN ═════════════════════════════════ */}
              <div className="space-y-5">
                {/* SECTION 2 — Participants (Paid By + Split Between side-by-side) */}
                <Card className="border shadow-sm">
                  <CardHeader className="pb-0 pt-5 px-5">
                    <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      Expense Participants
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 sm:divide-x sm:divide-gray-100 gap-5 sm:gap-0">
                      {/* Paid By */}
                      <div className="sm:pr-5">
                        <ColHeader
                          icon={Wallet}
                          label="Paid By"
                          color="text-blue-600"
                        />

                        {isSinglePayer && totalAmount && totalAmount > 0 && (
                          <div className="mb-2.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                            <span className="font-semibold">
                              {selectedPayerMembers[0]?.name}
                            </span>{" "}
                            paid{" "}
                            <span className="font-semibold">
                              {formatRupee(totalAmount)}
                            </span>
                          </div>
                        )}

                        <div className="space-y-1.5">
                          {tripMembers.map((member) => {
                            const isPayer = selectedPayers.includes(member._id);
                            const showInput = isPayer && !isSinglePayer;

                            return (
                              <div key={member._id}>
                                <button
                                  type="button"
                                  onClick={() => togglePayer(member._id)}
                                  className={cn(
                                    "w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all duration-150",
                                    isPayer
                                      ? "border-blue-400 bg-blue-50/70"
                                      : "border-gray-200 bg-white hover:border-gray-300",
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                                      isPayer
                                        ? "bg-blue-600 border-blue-600"
                                        : "border-gray-300 bg-white",
                                    )}
                                  >
                                    {isPayer && (
                                      <Check className="h-2.5 w-2.5 text-white" />
                                    )}
                                  </div>
                                  <MemberAvatar name={member.name} size="xs" />
                                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                                    {member.name}
                                  </span>
                                  {isSinglePayer &&
                                    isPayer &&
                                    totalAmount &&
                                    totalAmount > 0 && (
                                      <Badge
                                        variant="secondary"
                                        className="bg-blue-100 text-blue-700 border-blue-200 text-xs font-semibold px-2"
                                      >
                                        {formatRupee(totalAmount)}
                                      </Badge>
                                    )}
                                </button>

                                {showInput && (
                                  <div className="mt-1 ml-7 relative w-full max-w-[160px]">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                      <IndianRupee className="h-3 w-3" />
                                    </span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      placeholder="0.00"
                                      value={payerAmounts[member._id] ?? ""}
                                      onChange={(e) => {
                                        const v = e.target.value;
                                        const n = v === "" ? 0 : parseFloat(v);
                                        setPayerAmounts((cur) => ({
                                          ...cur,
                                          [member._id]: Number.isNaN(n) ? 0 : n,
                                        }));
                                      }}
                                      className="pl-7 h-8 text-sm border-2 focus:border-blue-400"
                                    />
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {selectedPayers.length === 0 && (
                          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Select at least
                            one payer
                          </p>
                        )}
                        {totalAmount &&
                          totalAmount > 0 &&
                          selectedPayers.length > 1 && (
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Paid Total
                              </span>
                              <ValidationPill
                                paid={roundToTwoDecimals(payerTotal)}
                                total={totalAmount}
                                valid={isPaymentValid}
                              />
                            </div>
                          )}
                      </div>

                      {/* Split Between */}
                      <div className="sm:pl-5">
                        <ColHeader
                          icon={Users}
                          label="Split Between"
                          color="text-purple-600"
                        />

                        <div className="space-y-1.5">
                          {tripMembers.map((member) => {
                            const isParticipant = selectedParticipants.includes(
                              member._id,
                            );
                            return (
                              <button
                                key={member._id}
                                type="button"
                                onClick={() => toggleParticipant(member._id)}
                                className={cn(
                                  "w-full flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-all duration-150",
                                  isParticipant
                                    ? "border-purple-400 bg-purple-50/70"
                                    : "border-gray-200 bg-white hover:border-gray-300",
                                )}
                              >
                                <div
                                  className={cn(
                                    "h-4 w-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors",
                                    isParticipant
                                      ? "bg-purple-600 border-purple-600"
                                      : "border-gray-300 bg-white",
                                  )}
                                >
                                  {isParticipant && (
                                    <Check className="h-2.5 w-2.5 text-white" />
                                  )}
                                </div>
                                <MemberAvatar name={member.name} size="xs" />
                                <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                                  {member.name}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {selectedParticipants.length === 0 && (
                          <p className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" /> Select at least
                            one participant
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* SECTION 4 — Dynamic Breakdown */}
                {selectedParticipants.length > 0 && (
                  <Card className="border shadow-sm">
                    <CardHeader className="pb-0 pt-5 px-5">
                      <CardTitle className="text-sm font-semibold text-gray-700">
                        Expense Split
                        <span className="ml-2 font-normal text-gray-400 text-xs">
                          {splitType === "equal"
                            ? "equal share per person"
                            : "custom amounts"}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5 pt-3 space-y-2">
                      {selectedParticipantMembers.map((member) => {
                        const equalShare =
                          equalParticipantShares.find(
                            (x) => x.memberId === member._id,
                          )?.amount ?? 0;
                        const shareValue =
                          participantShares[member._id] ?? equalShare;

                        return (
                          <div
                            key={member._id}
                            className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/60 px-3 py-2"
                          >
                            <MemberAvatar name={member.name} size="xs" />
                            <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                              {member.name}
                            </span>

                            {splitType === "equal" ? (
                              <Badge
                                variant="secondary"
                                className="bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-xs px-2.5"
                              >
                                {formatRupee(equalShare)}
                              </Badge>
                            ) : (
                              <div className="relative w-28 shrink-0">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                  <IndianRupee className="h-3 w-3" />
                                </span>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  placeholder="0.00"
                                  value={shareValue || ""}
                                  onChange={(e) => {
                                    const v = e.target.value;
                                    const n = v === "" ? 0 : parseFloat(v);
                                    setParticipantShares((cur) => ({
                                      ...cur,
                                      [member._id]: Number.isNaN(n) ? 0 : n,
                                    }));
                                  }}
                                  className="pl-7 h-8 text-sm border-2 focus:border-amber-400"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {splitType === "unequal" &&
                        totalAmount &&
                        totalAmount > 0 && (
                          <div className="flex items-center justify-between pt-1">
                            <span className="text-xs text-gray-500">
                              Split Total
                            </span>
                            <ValidationPill
                              paid={roundToTwoDecimals(participantTotal)}
                              total={totalAmount}
                              valid={isParticipantValid}
                            />
                          </div>
                        )}
                      {splitType === "unequal" &&
                        !isParticipantValid &&
                        totalAmount &&
                        totalAmount > 0 && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Shares must add up to {formatRupee(totalAmount)}.
                          </p>
                        )}
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* ════════════════════════════════════════════════════
                FOOTER — Summary strip + action buttons
                Full-width, below the two-column grid
            ════════════════════════════════════════════════════ */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/60 px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm">
                <span className="text-gray-500">
                  Amount:{" "}
                  <span className="font-semibold text-gray-900">
                    {totalAmount && totalAmount > 0
                      ? formatRupee(totalAmount)
                      : "—"}
                  </span>
                </span>
                <span className="text-gray-500">
                  Payers:{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedPayerMembers.length || "—"}
                  </span>
                </span>
                <span className="text-gray-500">
                  Participants:{" "}
                  <span className="font-semibold text-gray-900">
                    {selectedParticipantMembers.length || "—"}
                  </span>
                </span>
                <span className="text-gray-500">
                  Split:{" "}
                  <span className="font-semibold text-gray-900 capitalize">
                    {splitType === "equal" ? "Equal" : "Unequal"}
                  </span>
                </span>

                {totalAmount && totalAmount > 0 && (
                  <>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        isPaymentValid
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-600 border-red-200",
                      )}
                    >
                      {isPaymentValid ? "✓" : "✗"} Payment
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full border",
                        isParticipantValid
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-red-50 text-red-600 border-red-200",
                      )}
                    >
                      {isParticipantValid ? "✓" : "✗"} Split
                    </span>
                  </>
                )}

                {/* Push buttons to the right */}
                <div className="ml-auto flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push(`/expenses/${tripId}`)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting || !canSubmit}
                    className="gap-2 bg-blue-600 hover:bg-blue-700 min-w-36 cursor-pointer transition-colors"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Add Expense
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
