import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireCustomer } from "@/lib/auth/session";
import { CustomerHeader } from "@/components/customer/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatDateTime, formatMonthYear } from "@/lib/utils";
import { BillService } from "@/lib/services/bill.service";
import {
  CreditCard,
  Receipt,
  Calendar,
  Phone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  History,
} from "lucide-react";
import { BillStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  const session = await requireCustomer();

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      bills: {
        orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }],
        take: 3,
      },
      payments: {
        include: { bill: true },
        orderBy: { submittedAt: "desc" },
        take: 3,
      },
    },
  });

  if (!customer) {
    return <div>Customer not found</div>;
  }

  // Find active / latest bill
  const currentBill = await BillService.getCurrentBill(customer.id);
  const lastPayment = customer.payments[0] || null;

  const isBillPayable =
    currentBill &&
    (currentBill.status === BillStatus.UNPAID ||
      currentBill.status === BillStatus.OVERDUE);

  const isPendingVerification =
    currentBill && currentBill.status === BillStatus.PAYMENT_SUBMITTED;

  return (
    <div className="space-y-6">
      <CustomerHeader
        title={`Welcome, ${customer.name}`}
        description="View your broadband subscription, pay your monthly bills via bKash, and track verification."
      />

      {/* Hero Current Bill Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Current Monthly Invoice
              </span>
              {currentBill && <StatusBadge status={currentBill.status} />}
            </div>

            {currentBill ? (
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {formatCurrency(currentBill.amount.toString())}
                  </span>
                  <span className="text-sm font-medium text-slate-500">
                    for {formatMonthYear(currentBill.billingMonth, currentBill.billingYear)}
                  </span>
                </div>

                <p className="mt-2 text-xs sm:text-sm text-slate-500 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  Due Date:{" "}
                  <span className="font-semibold text-slate-700">
                    {formatDate(currentBill.dueDate)}
                  </span>
                  {new Date() > currentBill.dueDate && currentBill.status !== BillStatus.PAID && (
                    <span className="text-rose-600 font-bold ml-1">(Past Due)</span>
                  )}
                </p>
              </div>
            ) : (
              <div>
                <p className="text-2xl font-bold text-slate-900">No Pending Bills</p>
                <p className="text-xs text-slate-500 mt-1">
                  You are all caught up! There are no outstanding invoices for your account.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {isBillPayable && (
              <Link href={`/portal/pay-bill?billId=${currentBill.id}`}>
                <Button variant="bkash" size="lg" className="w-full sm:w-auto shadow-md">
                  <CreditCard className="h-5 w-5 mr-2" />
                  PAY BILL NOW
                </Button>
              </Link>
            )}

            {isPendingVerification && (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-amber-800 text-xs sm:text-sm font-medium">
                <Clock className="h-5 w-5 text-amber-600 shrink-0" />
                <span>Payment submitted! Waiting for admin verification.</span>
              </div>
            )}

            {currentBill?.status === BillStatus.PAID && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-800 text-xs sm:text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
                <span>Invoice is fully paid. Thank you!</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Highlights & Last Payment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-400 block">Subscriber ID</span>
            <span className="font-mono text-xl font-bold text-blue-600 mt-1 block">
              {customer.customerCode}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              Phone: {customer.phone}
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-400 block">Monthly Rate</span>
            <span className="text-xl font-bold text-slate-900 mt-1 block">
              {formatCurrency(customer.monthlyBill.toString())}
            </span>
            <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Broadband Connected
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <span className="text-xs font-medium text-slate-400 block">Last bKash Submission</span>
            {lastPayment ? (
              <div className="mt-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-slate-800 truncate">
                    {lastPayment.transactionId}
                  </span>
                  <StatusBadge status={lastPayment.status} />
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {formatDateTime(lastPayment.submittedAt)}
                </span>
              </div>
            ) : (
              <span className="text-xs text-slate-400 mt-2 block">No past transactions</span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Bills Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Recent Bills
            </CardTitle>
          </div>
          <Link href="/portal/bills">
            <Button variant="ghost" size="sm" className="text-xs">
              View All Bills
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-3 px-4">Billing Month</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customer.bills.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No bills found.
                    </td>
                  </tr>
                ) : (
                  customer.bills.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatMonthYear(b.billingMonth, b.billingYear)}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {formatCurrency(b.amount.toString())}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{formatDate(b.dueDate)}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        {(b.status === BillStatus.UNPAID || b.status === BillStatus.OVERDUE) && (
                          <Link href={`/portal/pay-bill?billId=${b.id}`}>
                            <Button variant="bkash" size="sm">
                              Pay
                            </Button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

