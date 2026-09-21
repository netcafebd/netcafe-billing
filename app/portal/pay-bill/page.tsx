import React, { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { requireCustomer } from "@/lib/auth/session";
import { CustomerHeader } from "@/components/customer/header";
import { PayBillForm } from "./pay-bill-form";
import { BillStatus } from "@prisma/client";

import { DEFAULT_BKASH_QR_IMAGE } from "@/lib/constants/qr";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    billId?: string;
  }>;
}

export default async function PayBillPage({ searchParams }: Props) {
  const session = await requireCustomer();
  const params = await searchParams;

  const [customer, bills, settings] = await Promise.all([
    prisma.customer.findUnique({
      where: { id: session.customerId },
      select: { phone: true },
    }),
    prisma.bill.findMany({
      where: { customerId: session.customerId },
      orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }],
    }),
    prisma.iSPSettings.findFirst(),
  ]);

  // Priority bill to select:
  // 1. Specified in query param
  // 2. First UNPAID or OVERDUE bill
  // 3. First PAYMENT_SUBMITTED bill
  // 4. Most recent bill
  const requestedBillId = params.billId;
  let defaultSelectedId = "";

  if (requestedBillId && bills.some((b) => b.id === requestedBillId)) {
    defaultSelectedId = requestedBillId;
  } else {
    const payable = bills.find(
      (b) => b.status === BillStatus.UNPAID || b.status === BillStatus.OVERDUE
    );
    defaultSelectedId = payable ? payable.id : bills[0]?.id || "";
  }

  const defaultSettings = settings || {
    ispName: "NETCAFE",
    bkashNumber: "01622 280 960",
    bkashQrCode: DEFAULT_BKASH_QR_IMAGE,
    paymentInstructions:
      "1. Open bKash App\n2. Select 'Send Money'\n3. Enter ISP bKash Number: 01622 280 960 (বা QR স্ক্যান করুন)\n4. Enter exact bill amount\n5. Copy the Transaction ID\n6. Submit the Transaction ID here",
  };

  return (
    <div className="space-y-6">
      <CustomerHeader
        title="Pay Your Broadband Bill"
        description="Follow the steps to send money via bKash and submit your Transaction ID for manual verification."
      />

      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading payment details...</div>}>
        <PayBillForm
          bills={bills.map((b) => ({
            id: b.id,
            billingMonth: b.billingMonth,
            billingYear: b.billingYear,
            amount: Number(b.amount),
            status: b.status,
          }))}
          selectedBillId={defaultSelectedId}
          ispSettings={{
            ispName: defaultSettings.ispName,
            bkashNumber: defaultSettings.bkashNumber,
            bkashQrCode: defaultSettings.bkashQrCode || DEFAULT_BKASH_QR_IMAGE,
            paymentInstructions: defaultSettings.paymentInstructions || "",
          }}
          customerPhone={customer?.phone || ""}
        />
      </Suspense>
    </div>
  );
}

