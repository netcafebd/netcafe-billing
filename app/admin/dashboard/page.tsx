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
  Cpu,
  Activity,
  Server,
  ExternalLink,
} from "lucide-react";
import { PaymentActions } from "./payment-actions";
import { ProcessCleanupButton } from "./process-actions";
import { getSystemProcessInfo } from "@/lib/services/system.service";

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

  const sysInfo = getSystemProcessInfo();

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

      {/* Server & CloudLinux LVE Process Monitor */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-3 flex flex-row items-center justify-between border-b border-slate-100">
          <div>
            <CardTitle className="flex items-center gap-2 text-base text-slate-800">
              <Server className="h-5 w-5 text-indigo-600" />
              Server & Process Health Monitor
              <span className="rounded-full bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 font-bold">
                LVE Monitored
              </span>
            </CardTitle>
            <CardDescription className="text-xs">
              Live cPanel CloudLinux process & thread usage for your hosting account.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <ProcessCleanupButton />
            <a
              href="/api/debug"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              Raw Diagnostics (JSON)
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Running Processes</span>
                <Cpu className="h-4 w-4 text-slate-400" />
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {sysInfo.totalProcesses}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Active OS processes</p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Active Threads (NLWP)</span>
                <Activity
                  className={`h-4 w-4 ${
                    sysInfo.totalThreads > 80
                      ? "text-red-500"
                      : sysInfo.totalThreads > 50
                      ? "text-amber-500"
                      : "text-emerald-500"
                  }`}
                />
              </div>
              <div
                className={`mt-1 text-2xl font-bold ${
                  sysInfo.totalThreads > 80
                    ? "text-red-600"
                    : sysInfo.totalThreads > 50
                    ? "text-amber-600"
                    : "text-emerald-600"
                }`}
              >
                {sysInfo.totalThreads}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {sysInfo.totalThreads <= 50 ? "Healthy (Under LVE limit)" : "High thread count"}
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Node RSS Memory</span>
                <span className="text-[10px] font-mono text-slate-400">PID {sysInfo.currentPid}</span>
              </div>
              <div className="mt-1 text-2xl font-bold text-slate-900">
                {sysInfo.memoryUsageMB} <span className="text-sm font-normal text-slate-500">MB</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">Resident memory usage</p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Runtime & Uptime</span>
                <span className="text-[10px] font-mono text-slate-400">{sysInfo.platform}</span>
              </div>
              <div className="mt-1 text-base font-bold text-slate-900 truncate">
                {sysInfo.nodeVersion}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Up for {sysInfo.uptimeMinutes} min{sysInfo.uptimeMinutes === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {sysInfo.processes && sysInfo.processes.length > 0 && (
            <div className="rounded-md border border-slate-200 overflow-hidden">
              <div className="bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 flex justify-between items-center border-b border-slate-200">
                <span>Account Process Details (cPanel User)</span>
                <span className="text-[11px] font-normal text-slate-400">
                  ps -u $(whoami) -o pid,nlwp,rss,comm
                </span>
              </div>
              <div className="overflow-x-auto max-h-56">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200 sticky top-0">
                    <tr>
                      <th className="py-2 px-3 font-semibold">PID</th>
                      <th className="py-2 px-3 font-semibold">Threads (NLWP)</th>
                      <th className="py-2 px-3 font-semibold">RSS Memory</th>
                      <th className="py-2 px-3 font-semibold">Command</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sysInfo.processes.map((p, idx) => (
                      <tr
                        key={`${p.pid}-${idx}`}
                        className={`hover:bg-slate-50 ${
                          Number(p.pid) === sysInfo.currentPid ? "bg-blue-50/40" : ""
                        }`}
                      >
                        <td className="py-2 px-3 font-semibold text-slate-800">
                          {p.pid}
                          {Number(p.pid) === sysInfo.currentPid && (
                            <span className="ml-1 text-[10px] font-sans rounded bg-blue-100 text-blue-800 px-1 py-0.2">
                              current
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-700">{p.threads}</td>
                        <td className="py-2 px-3 text-slate-700">{p.memoryMB} MB</td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-xs">{p.name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {sysInfo.error && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded p-2 border border-amber-200">
              Note: Detailed process listing fallback active: {sysInfo.error}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

