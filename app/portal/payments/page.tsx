import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireCustomer } from "@/lib/auth/session";
import { CustomerHeader } from "@/components/customer/header";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, formatMonthYear } from "@/lib/utils";
import { History, AlertTriangle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerPaymentsPage() {
  const session = await requireCustomer();

  const payments = await prisma.payment.findMany({
    where: { customerId: session.customerId },
    orderBy: { submittedAt: "desc" },
    include: {
      bill: true,
    },
  });

  return (
    <div className="space-y-6">
      <CustomerHeader
        title="Payment Submission History"
        description="Track all bKash transaction submissions, verification timestamps, and remarks."
      />

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Bill Period</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Transaction ID</th>
                  <th className="py-3.5 px-4">Sender Phone</th>
                  <th className="py-3.5 px-4">Submitted Date</th>
                  <th className="py-3.5 px-4">Verified Date</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No payment submissions found.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {formatMonthYear(p.bill.billingMonth, p.bill.billingYear)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(p.amount.toString())}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.transactionId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.senderPhone}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDateTime(p.submittedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {p.verifiedAt ? formatDateTime(p.verifiedAt) : "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <StatusBadge status={p.status} />
                          {p.rejectionReason && (
                            <div className="text-[11px] text-rose-600 bg-rose-50 p-1.5 rounded border border-rose-200 max-w-xs flex items-start gap-1">
                              <AlertTriangle className="h-3 w-3 shrink-0 mt-0.5" />
                              <span>{p.rejectionReason}</span>
                            </div>
                          )}
                        </div>
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

