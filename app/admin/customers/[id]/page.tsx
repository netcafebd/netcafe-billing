import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, formatDateTime, formatMonthYear } from "@/lib/utils";
import { EditCustomerModal } from "./edit-customer-modal";
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Receipt,
  History,
} from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      bills: {
        orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }],
      },
      payments: {
        include: { bill: true },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/customers">
          <Button variant="ghost" size="sm" className="text-slate-500">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to Customers
          </Button>
        </Link>
      </div>

      <AdminHeader
        title={`${customer.name} (${customer.customerCode})`}
        description="Subscriber details, billing cycle breakdown, and bKash payment verification history."
      >
        <EditCustomerModal
          customer={{
            id: customer.id,
            customerCode: customer.customerCode,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            monthlyBill: Number(customer.monthlyBill),
            status: customer.status,
          }}
        />
      </AdminHeader>

      {/* Customer Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            Subscriber Profile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Customer ID</span>
              <span className="font-mono font-bold text-blue-600 text-base">
                {customer.customerCode}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Account Status</span>
              <div className="mt-1">
                <StatusBadge status={customer.status} />
              </div>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Monthly Rate</span>
              <span className="font-bold text-slate-900 text-base">
                {formatCurrency(customer.monthlyBill.toString())}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-500 block">Connection Date</span>
              <span className="font-medium text-slate-700">
                {formatDate(customer.connectionDate)}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="font-mono">{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{customer.email || "No email on record"}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate">{customer.address}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bills & Payments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bills History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="h-4 w-4 text-blue-600" />
              Generated Bills ({customer.bills.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Period</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Due Date</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customer.bills.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No bills generated yet.
                      </td>
                    </tr>
                  ) : (
                    customer.bills.map((bill) => (
                      <tr key={bill.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {formatMonthYear(bill.billingMonth, bill.billingYear)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {formatCurrency(bill.amount.toString())}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDate(bill.dueDate)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={bill.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Payments History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-blue-600" />
              bKash Payment Submissions ({customer.payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/75 text-slate-500 uppercase text-[11px] font-semibold">
                  <tr>
                    <th className="py-2.5 px-4">Trx ID</th>
                    <th className="py-2.5 px-4">Amount</th>
                    <th className="py-2.5 px-4">Submitted</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customer.payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-slate-400">
                        No payment submissions recorded.
                      </td>
                    </tr>
                  ) : (
                    customer.payments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {p.transactionId}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {formatCurrency(p.amount.toString())}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {formatDateTime(p.submittedAt)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={p.status} />
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
    </div>
  );
}

