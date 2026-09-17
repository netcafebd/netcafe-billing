import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDateTime, formatMonthYear } from "@/lib/utils";
import { BillStatus, CustomerStatus, PaymentStatus } from "@prisma/client";
import {
  Users,
  UserCheck,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { PaymentActions } from "./payment-actions";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  await requireAdmin();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  let totalCustomers = 0;
  let activeCustomers = 0;
  let inactiveCustomers = 0;
  let totalBills = 0;
  let paidBillsCount = 0;
  let unpaidBillsCount = 0;
  let pendingPaymentsCount = 0;
  let thisMonthCollection = 0;
  let recentPendingPayments: any[] = [];
  let dashboardError: string | null = null;

  try {
    const [
      tc,
      ac,
      ic,
      tb,
      pbc,
      ubc,
      ppc,
      mpp,
      rpp,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.customer.count({ where: { status: CustomerStatus.ACTIVE } }),
      prisma.customer.count({
        where: { status: { in: [CustomerStatus.INACTIVE, CustomerStatus.SUSPENDED] } },
      }),
      prisma.bill.count(),
      prisma.bill.count({ where: { status: BillStatus.PAID } }),
      prisma.bill.count({
        where: { status: { in: [BillStatus.UNPAID, BillStatus.OVERDUE, BillStatus.PAYMENT_SUBMITTED] } },
      }),
      prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
      prisma.payment.aggregate({
        where: {
          status: PaymentStatus.VERIFIED,
          bill: {
            billingMonth: currentMonth,
            billingYear: currentYear,
          },
        },
        _sum: { amount: true },
      }),
      prisma.payment.findMany({
        where: { status: PaymentStatus.PENDING },
        include: {
          customer: true,
          bill: true,
        },
        orderBy: { submittedAt: "desc" },
        take: 5,
      }),
    ]);

    totalCustomers = tc;
    activeCustomers = ac;
    inactiveCustomers = ic;
    totalBills = tb;
    paidBillsCount = pbc;
    unpaidBillsCount = ubc;
    pendingPaymentsCount = ppc;
    thisMonthCollection = mpp._sum.amount ? Number(mpp._sum.amount) : 0;
    recentPendingPayments = rpp;
  } catch (err: any) {
    console.error("Dashboard query error:", err);
    dashboardError = err?.message || String(err);
  }

  const statCards = [
    {
      title: "Total Customers",
      value: totalCustomers.toString(),
      subtext: `${activeCustomers} active subscriber${activeCustomers === 1 ? "" : "s"}`,
      icon: Users,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      href: "/admin/customers",
    },
    {
      title: "Pending Payments",
      value: pendingPaymentsCount.toString(),
      subtext: pendingPaymentsCount > 0 ? "Requires manual verification" : "All clear",
      icon: Clock,
      color: pendingPaymentsCount > 0 ? "text-amber-600 bg-amber-50 border-amber-200" : "text-slate-600 bg-slate-50 border-slate-200",
      href: "/admin/payments?status=PENDING",
      highlight: pendingPaymentsCount > 0,
    },
    {
      title: "This Month Collection",
      value: formatCurrency(thisMonthCollection),
      subtext: formatMonthYear(currentMonth, currentYear),
      icon: TrendingUp,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      href: "/admin/reports",
    },
    {
      title: "Unpaid / Overdue Bills",
      value: unpaidBillsCount.toString(),
      subtext: `${paidBillsCount} paid out of ${totalBills} total bills`,
      icon: Receipt,
      color: unpaidBillsCount > 0 ? "text-rose-600 bg-rose-50 border-rose-100" : "text-emerald-600 bg-emerald-50 border-emerald-100",
      href: "/admin/bills?status=UNPAID",
    },
  ];

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Admin Dashboard"
        description="Overview of customers, monthly billing cycles, and manual bKash payment verification."
      >
        <Link href="/admin/bills">
          <Button variant="outline" size="sm">
            <Receipt className="h-4 w-4 mr-1.5" />
            Generate Bills
          </Button>
        </Link>
        <Link href="/admin/customers">
          <Button variant="primary" size="sm">
            <Users className="h-4 w-4 mr-1.5" />
            Add Customer
          </Button>
        </Link>
      </AdminHeader>

      {dashboardError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900 shadow-xs">
          <p className="font-bold text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            Database Sync Notice
          </p>
          <p className="font-mono text-xs mt-1 bg-white/70 p-2 rounded border border-amber-200/50 break-all">
            {dashboardError}
          </p>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:border-slate-300 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500">{card.title}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{card.value}</p>
                  <p className="text-xs text-slate-400 mt-1">{card.subtext}</p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border ${card.color}`}
                >
                  <card.icon className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pending Payment Verification Banner / Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Pending Payment Submissions
              {pendingPaymentsCount > 0 && (
                <span className="rounded-full bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 font-bold">
                  {pendingPaymentsCount} Pending
                </span>
              )}
            </CardTitle>
            <CardDescription>
              bKash transactions submitted by customers awaiting your manual verification.
            </CardDescription>
          </div>
          <Link href="/admin/payments">
            <Button variant="ghost" size="sm" className="text-xs font-semibold">
              View All Payments
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentPendingPayments.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium text-slate-700">No pending payments</p>
              <p className="text-xs text-slate-400 mt-1">
                All submitted bKash payments have been reviewed and verified!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase bg-slate-50/50">
                  <tr>
                    <th className="py-3 px-3">Customer</th>
                    <th className="py-3 px-3">Bill Period</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">bKash Trx ID</th>
                    <th className="py-3 px-3">Sender Phone</th>
                    <th className="py-3 px-3">Submitted</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentPendingPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900">
                          {payment.customer.name}
                        </div>
                        <div className="text-xs text-blue-600 font-mono">
                          {payment.customer.customerCode}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        {formatMonthYear(payment.bill.billingMonth, payment.bill.billingYear)}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900">
                        {formatCurrency(payment.amount.toString())}
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 bg-slate-50 rounded px-2 py-1">
                        {payment.transactionId}
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-mono">
                        {payment.senderPhone}
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-500">
                        {formatDateTime(payment.submittedAt)}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <PaymentActions
                          paymentId={payment.id}
                          customerName={payment.customer.name}
                          trxId={payment.transactionId}
                          amount={formatCurrency(payment.amount.toString())}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

