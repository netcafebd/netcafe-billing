import React, { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { PaymentTableClient } from "./payment-table-client";
import { PaymentStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function PaymentsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const statusFilter = params.status as PaymentStatus | undefined;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 12;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { transactionId: { contains: search, mode: "insensitive" } },
      { senderPhone: { contains: search } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { customer: { customerCode: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (statusFilter && Object.values(PaymentStatus).includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  const [totalCount, pendingCount, payments] = await Promise.all([
    prisma.payment.count({ where: whereClause }),
    prisma.payment.count({ where: { status: PaymentStatus.PENDING } }),
    prisma.payment.findMany({
      where: whereClause,
      include: {
        customer: true,
        bill: true,
      },
      orderBy: { submittedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Payment Submissions & Verification"
        description="Verify manual bKash transactions submitted by customers and maintain an immutable financial trail."
      />

      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading payments...</div>}>
        <PaymentTableClient
          payments={payments.map((p) => ({
            id: p.id,
            customerCode: p.customer.customerCode,
            customerName: p.customer.name,
            phone: p.customer.phone,
            billMonth: p.bill.billingMonth,
            billYear: p.bill.billingYear,
            amount: Number(p.amount),
            transactionId: p.transactionId,
            senderPhone: p.senderPhone,
            status: p.status,
            submittedAt: p.submittedAt.toISOString(),
            verifiedAt: p.verifiedAt ? p.verifiedAt.toISOString() : null,
            rejectionReason: p.rejectionReason,
            notes: p.notes,
          }))}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          pendingCount={pendingCount}
        />
      </Suspense>
    </div>
  );
}

