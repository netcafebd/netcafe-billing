"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime, formatMonthYear } from "@/lib/utils";
import { verifyPaymentAction, rejectPaymentAction } from "@/app/actions/payment.actions";
import {
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Info,
} from "lucide-react";
import { PaymentStatus } from "@prisma/client";

interface PaymentItem {
  id: string;
  customerCode: string;
  customerName: string;
  phone: string;
  billMonth: number;
  billYear: number;
  amount: number;
  transactionId: string;
  senderPhone: string;
  status: PaymentStatus;
  submittedAt: string;
  verifiedAt: string | null;
  rejectionReason: string | null;
  notes: string | null;
}

interface Props {
  payments: PaymentItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  pendingCount: number;
}

export function PaymentTableClient({
  payments,
  totalCount,
  currentPage,
  pageSize,
  pendingCount,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams?.get("status") || "ALL");

  // Selected payment for actions
  const [activePayment, setActivePayment] = useState<PaymentItem | null>(null);
  const [actionType, setActionType] = useState<"view" | "verify" | "reject" | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  function handleFilter(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);
    params.set("page", "1");
    router.push(`/admin/payments?${params.toString()}`);
  }

  function handleQuickTab(status: string) {
    setSelectedStatus(status);
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (status !== "ALL") params.set("status", status);
    params.set("page", "1");
    router.push(`/admin/payments?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    router.push(`/admin/payments?${params.toString()}`);
  }

  async function handleVerify() {
    if (!activePayment) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await verifyPaymentAction(activePayment.id);
      if (!res.success) {
        setError(res.message || "Failed to verify payment");
        setIsLoading(false);
        return;
      }

      setActionType(null);
      setActivePayment(null);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!activePayment) return;
    if (!rejectionReason.trim()) {
      setError("Please specify the reason for rejecting this payment.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await rejectPaymentAction({
        paymentId: activePayment.id,
        rejectionReason,
      });

      if (!res.success) {
        setError(res.message || "Failed to reject payment");
        setIsLoading(false);
        return;
      }

      setActionType(null);
      setActivePayment(null);
      setRejectionReason("");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleQuickTab("ALL")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedStatus === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => handleQuickTab("PENDING")}
            className={`relative rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedStatus === "PENDING"
                ? "bg-amber-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Pending Verification
            {pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-amber-200 text-amber-900 px-1.5 py-0.2 text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </button>
          <button
            onClick={() => handleQuickTab("VERIFIED")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedStatus === "VERIFIED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Verified (Paid)
          </button>
          <button
            onClick={() => handleQuickTab("REJECTED")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              selectedStatus === "REJECTED"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            Rejected
          </button>
        </div>

        <form onSubmit={handleFilter} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Trx ID, Phone, Customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-xs focus:border-blue-500 focus:outline-hidden"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Payments Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Bill Period</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">bKash Trx ID</th>
                  <th className="py-3.5 px-4">Sender Phone</th>
                  <th className="py-3.5 px-4">Submitted At</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No payments found for this filter.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{p.customerName}</div>
                        <div className="text-xs font-mono font-bold text-blue-600">
                          {p.customerCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        {formatMonthYear(p.billMonth, p.billYear)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          {p.transactionId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">
                        {p.senderPhone}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {formatDateTime(p.submittedAt)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="View submission details"
                            onClick={() => {
                              setActivePayment(p);
                              setActionType("view");
                            }}
                          >
                            <Eye className="h-4 w-4 text-slate-500" />
                          </Button>

                          {p.status === "PENDING" && (
                            <>
                              <Button
                                variant="primary"
                                size="sm"
                                className="bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => {
                                  setActivePayment(p);
                                  setError(null);
                                  setActionType("verify");
                                }}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                Verify
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-rose-600 border-rose-200 hover:bg-rose-50"
                                onClick={() => {
                                  setActivePayment(p);
                                  setError(null);
                                  setRejectionReason("");
                                  setActionType("reject");
                                }}
                              >
                                <XCircle className="h-3.5 w-3.5 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages} ({totalCount} total submissions)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Details Modal */}
      <Modal
        isOpen={actionType === "view" && !!activePayment}
        onClose={() => setActionType(null)}
        title="Payment Submission Details"
        description="Review complete transaction information submitted by the subscriber."
      >
        {activePayment && (
          <div className="space-y-4 text-sm">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer:</span>
                <span className="font-semibold text-slate-900">
                  {activePayment.customerName} ({activePayment.customerCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bill Period:</span>
                <span className="font-medium text-slate-900">
                  {formatMonthYear(activePayment.billMonth, activePayment.billYear)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <span className="font-bold text-emerald-700 text-base">
                  {formatCurrency(activePayment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">bKash Trx ID:</span>
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {activePayment.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender Phone:</span>
                <span className="font-mono text-slate-900">{activePayment.senderPhone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <StatusBadge status={activePayment.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted At:</span>
                <span className="text-slate-700">{formatDateTime(activePayment.submittedAt)}</span>
              </div>
              {activePayment.verifiedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Verified At:</span>
                  <span className="text-slate-700">{formatDateTime(activePayment.verifiedAt)}</span>
                </div>
              )}
            </div>

            {activePayment.notes && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-800">
                <span className="font-semibold block mb-0.5">Customer Notes:</span>
                {activePayment.notes}
              </div>
            )}

            {activePayment.rejectionReason && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                <span className="font-semibold block mb-0.5">Rejection Reason:</span>
                {activePayment.rejectionReason}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setActionType(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <Modal
        isOpen={actionType === "verify" && !!activePayment}
        onClose={() => !isLoading && setActionType(null)}
        title="Verify bKash Payment"
        description="Check your bKash merchant app or statement externally before confirming."
      >
        {activePayment && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subscriber:</span>
                <span className="font-semibold text-slate-900">
                  {activePayment.customerName} ({activePayment.customerCode})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount to Credit:</span>
                <span className="font-bold text-emerald-700 text-base">
                  {formatCurrency(activePayment.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction ID:</span>
                <span className="font-mono font-bold text-slate-900">
                  {activePayment.transactionId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sender Phone:</span>
                <span className="font-mono text-slate-900">{activePayment.senderPhone}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>
                Verification will immediately update this payment to <strong>VERIFIED</strong> and mark the corresponding invoice as <strong>PAID</strong>.
              </span>
            </div>

            {error && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setActionType(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleVerify}
                isLoading={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Confirm Verification
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={actionType === "reject" && !!activePayment}
        onClose={() => !isLoading && setActionType(null)}
        title="Reject Payment Submission"
        description="Explain why this bKash transaction is invalid."
      >
        {activePayment && (
          <form onSubmit={handleReject} className="space-y-4">
            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                Rejecting will set the payment to REJECTED and revert the customer invoice back to UNPAID or OVERDUE.
              </span>
            </div>

            <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              Customer: <span className="font-semibold text-slate-700">{activePayment.customerName}</span> • Trx ID: <span className="font-mono font-bold text-slate-800">{activePayment.transactionId}</span>
            </div>

            <Textarea
              label="Rejection Reason"
              placeholder="e.g. Transaction ID not found in bKash statement, or incorrect amount was sent."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              required
              autoFocus
            />

            {error && (
              <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
                {error}
              </p>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setActionType(null)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                isLoading={isLoading}
              >
                Reject Payment
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

