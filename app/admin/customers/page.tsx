import React, { Suspense } from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { CustomerTableClient } from "./customer-table";
import { CustomerStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{
    search?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function CustomersPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const statusFilter = params.status as CustomerStatus | undefined;
  const page = parseInt(params.page || "1", 10);
  const pageSize = 10;

  const whereClause: any = {};

  if (search) {
    whereClause.OR = [
      { customerCode: { contains: search, mode: "insensitive" } },
      { name: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
    ];
  }

  if (statusFilter && Object.values(CustomerStatus).includes(statusFilter)) {
    whereClause.status = statusFilter;
  }

  const [totalCount, customers] = await Promise.all([
    prisma.customer.count({ where: whereClause }),
    prisma.customer.findMany({
      where: whereClause,
      include: {
        bills: {
          orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }],
          take: 1,
        },
      },
      orderBy: { customerCode: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  // Suggest next customer code
  const lastCustomer = await prisma.customer.findFirst({
    orderBy: { createdAt: "desc" },
    select: { customerCode: true },
  });

  let nextCode = "CUST-0001";
  if (lastCustomer?.customerCode) {
    const match = lastCustomer.customerCode.match(/\d+/);
    if (match) {
      const nextNum = parseInt(match[0], 10) + 1;
      nextCode = `CUST-${String(nextNum).padStart(4, "0")}`;
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Customer Management"
        description="Register new subscribers, manage broadband accounts, reset passwords and track customer billing."
      />

      <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading customers...</div>}>
        <CustomerTableClient
          customers={customers.map((c) => ({
            id: c.id,
            customerCode: c.customerCode,
            name: c.name,
            phone: c.phone,
            email: c.email,
            address: c.address,
            monthlyBill: Number(c.monthlyBill),
            status: c.status,
            currentBill: c.bills[0]
              ? {
                  month: c.bills[0].billingMonth,
                  year: c.bills[0].billingYear,
                  amount: Number(c.bills[0].amount),
                  status: c.bills[0].status,
                }
              : null,
          }))}
          totalCount={totalCount}
          currentPage={page}
          pageSize={pageSize}
          defaultNextCode={nextCode}
        />
      </Suspense>
    </div>
  );
}

