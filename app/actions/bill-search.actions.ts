"use server";

import { prisma } from "@/lib/db/prisma";
import { BillStatus, CustomerStatus } from "@prisma/client";

export interface BillSearchResult {
  success: boolean;
  message?: string;
  customer?: {
    id: string;
    customerCode: string;
    name: string;
    phone: string;
    status: CustomerStatus;
    monthlyBill: number;
    latestBill?: {
      id: string;
      billingMonth: number;
      billingYear: number;
      amount: number;
      status: BillStatus;
      dueDate: Date;
      paidAt?: Date | null;
    };
    unpaidCount: number;
    totalDue: number;
  };
}

export async function searchCustomerBillAction(searchQuery: string): Promise<BillSearchResult> {
  const query = searchQuery?.trim();
  if (!query || query.length < 3) {
    return { success: false, message: "Please enter a valid Customer ID or Phone Number." };
  }

  try {
    const customer = await prisma.customer.findFirst({
      where: {
        OR: [
          { customerCode: { equals: query, mode: "insensitive" } },
          { phone: { contains: query } },
        ],
      },
      include: {
        bills: {
          orderBy: [
            { billingYear: "desc" },
            { billingMonth: "desc" },
          ],
          take: 5,
        },
      },
    });

    if (!customer) {
      return {
        success: false,
        message: `No customer record found matching "${query}". Please check your Customer ID or Phone number.`,
      };
    }

    const latestBill = customer.bills[0];
    const unpaidBills = customer.bills.filter(
      (b) => b.status === BillStatus.UNPAID || b.status === BillStatus.OVERDUE || b.status === BillStatus.PAYMENT_SUBMITTED
    );

    const totalDue = unpaidBills.reduce((acc, b) => acc + Number(b.amount), 0);

    return {
      success: true,
      customer: {
        id: customer.id,
        customerCode: customer.customerCode,
        name: customer.name,
        phone: customer.phone,
        status: customer.status,
        monthlyBill: Number(customer.monthlyBill),
        latestBill: latestBill
          ? {
              id: latestBill.id,
              billingMonth: latestBill.billingMonth,
              billingYear: latestBill.billingYear,
              amount: Number(latestBill.amount),
              status: latestBill.status,
              dueDate: latestBill.dueDate,
              paidAt: latestBill.paidAt,
            }
          : undefined,
        unpaidCount: unpaidBills.length,
        totalDue: totalDue > 0 ? totalDue : Number(customer.monthlyBill),
      },
    };
  } catch (err: any) {
    console.error("Bill search error:", err);
    return { success: false, message: "An error occurred while searching for the bill." };
  }
}
