"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/shared/alert";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { submitPaymentAction } from "@/app/actions/payment.actions";
import {
  Copy,
  Check,
  CreditCard,
  QrCode,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { BillStatus } from "@prisma/client";
import { DEFAULT_BKASH_QR_IMAGE } from "@/lib/constants/qr";

interface PayBillFormProps {
  bills: Array<{
    id: string;
    billingMonth: number;
    billingYear: number;
    amount: number;
    status: BillStatus;
  }>;
  selectedBillId: string;
  ispSettings: {
    ispName: string;
    bkashNumber: string;
    bkashQrCode: string;
    paymentInstructions: string;
  };
  customerPhone: string;
}

export function PayBillForm({
  bills,
  selectedBillId: initialSelectedBillId,
  ispSettings,
  customerPhone,
}: PayBillFormProps) {
  const router = useRouter();
  const [selectedBillId, setSelectedBillId] = useState(initialSelectedBillId);
  const [copied, setCopied] = useState(false);

  const [transactionId, setTransactionId] = useState("");
  const [senderPhone, setSenderPhone] = useState(customerPhone || "");
  const [notes, setNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const currentBill = bills.find((b) => b.id === selectedBillId) || bills[0];

  function handleCopyNumber() {
    navigator.clipboard.writeText(ispSettings.bkashNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBill) return;

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await submitPaymentAction({
        billId: currentBill.id,
        transactionId: transactionId.trim().toUpperCase(),
        senderPhone: senderPhone.trim(),
        notes: notes.trim(),
      });

      if (!res.success) {
        setError(res.message || "Failed to submit transaction.");
        setIsLoading(false);
        return;
      }

      setSuccess(
        "Payment submitted successfully! Your payment is waiting for admin verification."
      );
      setTransactionId("");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred while submitting payment.");
    } finally {
      setIsLoading(false);
    }
  }

  if (!currentBill) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">No Unpaid Invoices</h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            All your invoices are currently paid. There are no bills due for payment at this time.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isAlreadySubmitted = currentBill.status === BillStatus.PAYMENT_SUBMITTED;
  const isAlreadyPaid = currentBill.status === BillStatus.PAID;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: bKash Payment Instructions & ISP Details */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="border-pink-200 shadow-sm overflow-hidden">
          <div className="bg-[#e2136e] px-6 py-4 text-white flex items-center justify-between">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                Payment Method
              </span>
              <h3 className="text-lg font-bold">bKash Send Money</h3>
            </div>
            <div className="bg-white/20 rounded-xl px-3 py-1 text-xs font-bold">
              Manual Verification
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Bill Selector */}
            {bills.length > 1 && (
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Select Bill to Pay:
                </label>
                <select
                  value={selectedBillId}
                  onChange={(e) => {
                    setSelectedBillId(e.target.value);
                    setError(null);
                    setSuccess(null);
                  }}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800"
                >
                  {bills.map((b) => (
                    <option key={b.id} value={b.id}>
                      {formatMonthYear(b.billingMonth, b.billingYear)} — {formatCurrency(b.amount)} ({b.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Bill Summary Banner */}
            <div className="rounded-xl border border-pink-100 bg-pink-50/50 p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-pink-700 font-medium block">
                  Invoice Period: {formatMonthYear(currentBill.billingMonth, currentBill.billingYear)}
                </span>
                <span className="text-2xl font-extrabold text-slate-900 mt-0.5 block">
                  {formatCurrency(currentBill.amount)}
                </span>
              </div>
              <StatusBadge status={currentBill.status} />
            </div>

            {/* bKash Number Box with Copy Button */}
            <div className="rounded-2xl border-2 border-[#e2136e] bg-white p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide block">
                ISP bKash Number (Send Money to this number)
              </span>
              <div className="flex items-center justify-between mt-2 gap-3">
                <span className="font-mono text-2xl sm:text-3xl font-black text-[#e2136e] tracking-tight">
                  {ispSettings.bkashNumber}
                </span>
                <Button
                  type="button"
                  variant="bkash"
                  size="sm"
                  onClick={handleCopyNumber}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      COPIED!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      COPY NUMBER
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wider">
                Or Scan bKash Bangla QR
              </span>
              {(() => {
                const qrSrc =
                  ispSettings.bkashQrCode &&
                  ispSettings.bkashQrCode.trim() !== "" &&
                  ispSettings.bkashQrCode !== "/images/bkash-qr.png"
                    ? ispSettings.bkashQrCode
                    : DEFAULT_BKASH_QR_IMAGE;

                return qrSrc.startsWith("<svg") ? (
                  <div
                    className="h-52 w-52 flex items-center justify-center bg-white p-2 rounded-xl border border-slate-200 shadow-xs"
                    dangerouslySetInnerHTML={{ __html: qrSrc }}
                  />
                ) : (
                  <img
                    src={qrSrc}
                    alt="bKash QR Code"
                    className="h-52 w-52 object-contain bg-white rounded-xl border border-slate-200 p-2 shadow-xs"
                  />
                );
              })()}
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">
                Step-by-Step Payment Instructions:
              </span>
              {ispSettings.paymentInstructions}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Transaction Submission Form */}
      <div className="lg:col-span-6 space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Submit bKash Transaction ID
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {success && (
              <Alert
                type="success"
                title="Submission Received"
                message={success}
                className="mb-6"
              />
            )}

            {error && (
              <Alert
                type="error"
                title="Submission Error"
                message={error}
                className="mb-6"
              />
            )}

            {isAlreadyPaid ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-emerald-900 text-base">Bill Already Paid</h4>
                <p className="text-xs text-emerald-700">
                  This monthly invoice has already been verified and paid. No further action is required.
                </p>
              </div>
            ) : isAlreadySubmitted ? (
              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
                <Clock className="h-10 w-10 text-amber-600 mx-auto" />
                <h4 className="font-bold text-amber-900 text-base">Payment Under Verification</h4>
                <p className="text-xs text-amber-700">
                  You have already submitted a bKash Transaction ID for this bill. Our billing team is verifying the payment externally. Once verified, your invoice will be marked as PAID.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="bKash Transaction ID (TrxID)"
                  placeholder="e.g. BL98K4J2M1"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  helperText="Enter the 10-character code from your bKash SMS or App receipt"
                  required
                  autoFocus
                />

                <Input
                  label="Sender bKash Phone Number"
                  placeholder="01XXXXXXXXX"
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  helperText="The mobile number you used to send the payment"
                  required
                />

                <Input
                  label="Payment Amount (৳)"
                  value={formatCurrency(currentBill.amount)}
                  disabled
                  helperText="Amount is locked to the exact bill invoice"
                />

                <Textarea
                  label="Additional Notes (Optional)"
                  placeholder="Any reference or remarks (e.g. payment sent from friend's account)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="bkash"
                    size="lg"
                    isLoading={isLoading}
                    className="w-full font-bold shadow-md"
                  >
                    Submit Transaction ID
                  </Button>
                </div>

                <p className="text-[11px] text-slate-400 text-center mt-2">
                  Admin will manually verify the bKash transaction against statement. Bill status will become PAID upon verification.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

