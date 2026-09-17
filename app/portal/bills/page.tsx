import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { requireCustomer } from "@/lib/auth/session";
import { CustomerHeader } from "@/components/customer/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatMonthYear } from "@/lib/utils";
import { BillStatus } from "@prisma/client";
import { CreditCard, Receipt } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerBillsPage() {
  const session = await requireCustomer();

  const bills = await prisma.bill.findMany({
    where: { customerId: session.customerId },
    orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }],
    include: {
      payments: {
        orderBy: { submittedAt: "desc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <CustomerHeader
        title="My Broadband Bills"
        description="Review all monthly invoices issued to your account and their payment status."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Billing Month</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Paid Date</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No invoices found for your account.
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => {
                    const canPay =
                      bill.status === BillStatus.UNPAID ||
                      bill.status === BillStatus.OVERDUE;

                    return (
                      <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {formatMonthYear(bill.billingMonth, bill.billingYear)}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {formatCurrency(bill.amount.toString())}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {formatDate(bill.dueDate)}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={bill.status} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {bill.paidAt ? formatDate(bill.paidAt) : "—"}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {canPay ? (
                            <Link href={`/portal/pay-bill?billId=${bill.id}`}>
                              <Button variant="bkash" size="sm">
                                <CreditCard className="h-3.5 w-3.5 mr-1" />
                                Pay with bKash
                              </Button>
                            </Link>
                          ) : bill.status === BillStatus.PAYMENT_SUBMITTED ? (
                            <span className="text-xs text-amber-600 font-medium">
                              Under Review
                            </span>
                          ) : (
                            <span className="text-xs text-emerald-600 font-medium">
                              Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

