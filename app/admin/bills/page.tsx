import React, { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { BillManagementClient } from "./bill-management-client";
import { BillStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    month?: string;
    year?: string;
    page?: string;
  }>;
}

export default async function BillsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const search = params.search?.trim() || "";
  const statusFilter = params.status as BillStatus | undefined;
  const monthFilter = params.month && params.month !== "ALL" ? parseInt(params.month, 10) : undefined;
  const yearFilter = params.year ? parseInt(params.year, 10) : undefined;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 12;

  const whereClause: any = {};

  if (search) {
    whereClause.customer = {
      OR: [
        { customerCode: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { phone: { contains: search } },
      ],
    };
  }

  if (statusFilter && Object.values(BillStatus).includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  if (monthFilter) {
    whereClause.billingMonth = monthFilter;
  }

  if (yearFilter) {
    whereClause.billingYear = yearFilter;
  }

  const [totalCount, bills, activeCustomers] = await Promise.all([
    prisma.bill.count({ where: whereClause }),
    prisma.bill.findMany({
      where: whereClause,
      include: {
        customer: true,
      },
      orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.customer.findMany({
      where: { status: "ACTIVE" },
      select: {
        id: true,
        customerCode: true,
        name: true,
        monthlyBill: true,
      },
      orderBy: { customerCode: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Monthly Bill Management"
        description="Monitor billing status, generate invoices for active subscribers, and manage due dates."
      />

      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading bills...</div>}>
        <BillManagementClient
          bills={bills.map((b) => ({
            id: b.id,
            customerCode: b.customer.customerCode,
            customerName: b.customer.name,
            phone: b.customer.phone,
            billingMonth: b.billingMonth,
            billingYear: b.billingYear,
            amount: Number(b.amount),
            dueDate: b.dueDate.toISOString(),
            status: b.status,
            paidAt: b.paidAt ? b.paidAt.toISOString() : null,
          }))}
          customers={activeCustomers.map((c) => ({
            id: c.id,
            customerCode: c.customerCode,
            name: c.name,
            monthlyBill: Number(c.monthlyBill),
          }))}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          currentMonth={currentMonth}
          currentYear={currentYear}
        />
      </Suspense>
    </div>
  );
}

