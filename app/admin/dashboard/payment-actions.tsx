"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { verifyPaymentAction, rejectPaymentAction } from "@/app/actions/payment.actions";
import { Check, X, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";

interface PaymentActionsProps {
  paymentId: string;
  customerName: string;
  trxId: string;
  amount: string;
}

export function PaymentActions({
  paymentId,
  customerName,
  trxId,
  amount,
}: PaymentActionsProps) {
  const router = useRouter();
  const [verifyOpen, setVerifyOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleVerify() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await verifyPaymentAction(paymentId);
      if (!res.success) {
        setError(res.message || "Failed to verify payment");
        setIsLoading(false);
        return;
      }
      setVerifyOpen(false);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  async function handleReject(e: React.FormEvent) {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      setError("Rejection reason is required.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await rejectPaymentAction({ paymentId, rejectionReason });
      if (!res.success) {
        setError(res.message || "Failed to reject payment");
        setIsLoading(false);
        return;
      }
      setRejectOpen(false);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1.5">
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setError(null);
            setVerifyOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Check className="h-3.5 w-3.5" />
          Verify
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setError(null);
            setRejectionReason("");
            setRejectOpen(true);
          }}
          className="text-rose-600 border-rose-200 hover:bg-rose-50"
        >
          <X className="h-3.5 w-3.5" />
          Reject
        </Button>
      </div>

      {/* Verify Confirmation Modal */}
      <Modal
        isOpen={verifyOpen}
        onClose={() => !isLoading && setVerifyOpen(false)}
        title="Verify bKash Payment"
        description="Confirm that you have checked the bKash merchant/statement externally and received the money."
      >
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Customer:</span>
              <span className="font-semibold text-slate-900">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Amount:</span>
              <span className="font-bold text-emerald-700">{amount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID:</span>
              <span className="font-mono font-bold text-slate-900">{trxId}</span>
            </div>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setVerifyOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleVerify}
              isLoading={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Confirm & Mark Bill Paid
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={rejectOpen}
        onClose={() => !isLoading && setRejectOpen(false)}
        title="Reject Payment Submission"
        description="Provide a clear reason for the rejection. The bill status will revert to unpaid/overdue."
      >
        <form onSubmit={handleReject} className="space-y-4">
          <div className="flex items-center gap-2 text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              Rejecting will mark this payment submission as REJECTED and allow the customer to re-submit or correct their transaction ID.
            </span>
          </div>

          <Textarea
            label="Rejection Reason"
            placeholder="e.g. Transaction ID not found in bKash statement, or incorrect amount sent."
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
              variant="outline"
              type="button"
              size="md"
              onClick={() => setRejectOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="submit"
              size="md"
              isLoading={isLoading}
            >
              Reject Payment
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

