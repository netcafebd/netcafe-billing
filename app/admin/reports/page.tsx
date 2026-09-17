import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatMonthYear, MONTH_NAMES } from "@/lib/utils";
import { BillStatus, PaymentStatus } from "@prisma/client";
import {
  TrendingUp,
  CreditCard,
  AlertCircle,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    month?: string;
    year?: string;
  }>;
}

export default async function ReportsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const now = new Date();
  const selectedYear = params.year ? parseInt(params.year, 10) : now.getFullYear();
  const selectedMonth = params.month && params.month !== "ALL" ? parseInt(params.month, 10) : undefined;

  // Build filter for bills
  const billWhere: any = { billingYear: selectedYear };
  if (selectedMonth) billWhere.billingMonth = selectedMonth;

  // Aggregate bills
  const [
    totalBilledAgg,
    paidBillsAgg,
    unpaidBillsAgg,
    overdueBillsAgg,
    submittedBillsAgg,
    totalBillsCount,
    paidBillsCount,
    unpaidBillsCount,
    overdueBillsCount,
    submittedBillsCount,
  ] = await Promise.all([
    prisma.bill.aggregate({
      where: billWhere,
      _sum: { amount: true },
    }),
    prisma.bill.aggregate({
      where: { ...billWhere, status: BillStatus.PAID },
      _sum: { amount: true },
    }),
    prisma.bill.aggregate({
      where: { ...billWhere, status: BillStatus.UNPAID },
      _sum: { amount: true },
    }),
    prisma.bill.aggregate({
      where: { ...billWhere, status: BillStatus.OVERDUE },
      _sum: { amount: true },
    }),
    prisma.bill.aggregate({
      where: { ...billWhere, status: BillStatus.PAYMENT_SUBMITTED },
      _sum: { amount: true },
    }),
    prisma.bill.count({ where: billWhere }),
    prisma.bill.count({ where: { ...billWhere, status: BillStatus.PAID } }),
    prisma.bill.count({ where: { ...billWhere, status: BillStatus.UNPAID } }),
    prisma.bill.count({ where: { ...billWhere, status: BillStatus.OVERDUE } }),
    prisma.bill.count({ where: { ...billWhere, status: BillStatus.PAYMENT_SUBMITTED } }),
  ]);

  // Payment submissions stats
  const paymentWhere: any = {};
  if (selectedMonth) {
    paymentWhere.bill = { billingMonth: selectedMonth, billingYear: selectedYear };
  } else {
    paymentWhere.bill = { billingYear: selectedYear };
  }

  const [verifiedPaymentsCount, pendingPaymentsCount, rejectedPaymentsCount] =
    await Promise.all([
      prisma.payment.count({ where: { ...paymentWhere, status: PaymentStatus.VERIFIED } }),
      prisma.payment.count({ where: { ...paymentWhere, status: PaymentStatus.PENDING } }),
      prisma.payment.count({ where: { ...paymentWhere, status: PaymentStatus.REJECTED } }),
    ]);

  const totalBilled = totalBilledAgg._sum.amount ? Number(totalBilledAgg._sum.amount) : 0;
  const totalCollected = paidBillsAgg._sum.amount ? Number(paidBillsAgg._sum.amount) : 0;
  const totalUnpaid = unpaidBillsAgg._sum.amount ? Number(unpaidBillsAgg._sum.amount) : 0;
  const totalOverdue = overdueBillsAgg._sum.amount ? Number(overdueBillsAgg._sum.amount) : 0;
  const totalSubmitted = submittedBillsAgg._sum.amount ? Number(submittedBillsAgg._sum.amount) : 0;
  const totalOutstanding = totalUnpaid + totalOverdue + totalSubmitted;

  const collectionRate = totalBilled > 0 ? ((totalCollected / totalBilled) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Financial & Billing Reports"
        description="Comprehensive summary of billing cycles, collections, and pending reconciliation."
      />

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <form method="GET" className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 uppercase">Period Filter:</span>
            </div>

            <select
              name="month"
              defaultValue={selectedMonth?.toString() || "ALL"}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700"
            >
              <option value="ALL">All Months</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={(idx + 1).toString()}>
                  {name}
                </option>
              ))}
            </select>

            <select
              name="year"
              defaultValue={selectedYear.toString()}
              className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs text-slate-700"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Filter Report
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-blue-100 bg-linear-to-br from-blue-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Total Billed
                </p>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {formatCurrency(totalBilled)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {totalBillsCount} bill{totalBillsCount === 1 ? "" : "s"} generated
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Receipt className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 bg-linear-to-br from-emerald-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                  Total Collected
                </p>
                <p className="mt-2 text-3xl font-extrabold text-emerald-700">
                  {formatCurrency(totalCollected)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {paidBillsCount} paid invoices ({collectionRate}% collection rate)
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-linear-to-br from-rose-50/50 to-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                  Total Outstanding
                </p>
                <p className="mt-2 text-3xl font-extrabold text-rose-700">
                  {formatCurrency(totalOutstanding)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {unpaidBillsCount + overdueBillsCount} unpaid or overdue bills
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/20">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bill Status Breakdown Table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Invoice Status Breakdown
            </CardTitle>
            <CardDescription>
              Distribution of billed amounts across different statuses.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Count</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="font-medium text-slate-900">Paid Invoices</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{paidBillsCount}</td>
                  <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                    {formatCurrency(totalCollected)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-slate-900">Payment Submitted (Pending)</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{submittedBillsCount}</td>
                  <td className="py-3 px-4 text-right font-semibold text-amber-700">
                    {formatCurrency(totalSubmitted)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-slate-900">Unpaid Invoices</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{unpaidBillsCount}</td>
                  <td className="py-3 px-4 text-right font-semibold text-slate-900">
                    {formatCurrency(totalUnpaid)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-500" />
                    <span className="font-medium text-slate-900">Overdue Invoices</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{overdueBillsCount}</td>
                  <td className="py-3 px-4 text-right font-semibold text-rose-700">
                    {formatCurrency(totalOverdue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* bKash Payment Review Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-pink-600" />
              bKash Transactions Overview
            </CardTitle>
            <CardDescription>
              Summary of customer bKash transaction submissions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center">
                <span className="text-2xl font-bold text-amber-800">{pendingPaymentsCount}</span>
                <span className="block text-xs font-semibold text-amber-700 mt-1 uppercase">Pending Review</span>
              </div>
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
                <span className="text-2xl font-bold text-emerald-800">{verifiedPaymentsCount}</span>
                <span className="block text-xs font-semibold text-emerald-700 mt-1 uppercase">Verified</span>
              </div>
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-center">
                <span className="text-2xl font-bold text-rose-800">{rejectedPaymentsCount}</span>
                <span className="block text-xs font-semibold text-rose-700 mt-1 uppercase">Rejected</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <span className="font-semibold text-slate-800 block">Auditing & Safety Notice:</span>
              <p>
                All transaction verifications and rejections are executed in atomic database transactions and logged in the immutable audit registry with admin identity and exact timestamps.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

