"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { billCreateSchema, generateMonthlyBillsSchema } from "@/lib/validations/bill";
import { BillService } from "@/lib/services/bill.service";
import { logAuditEvent } from "@/lib/services/audit.service";
import { revalidatePath } from "next/cache";
import { BillStatus } from "@prisma/client";

export async function createBillAction(data: any) {
  const session = await requireAdmin();

  const parsed = billCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validation error" };
  }

  const { customerId, billingMonth, billingYear, amount, dueDate } = parsed.data;

  // 1. Check if customer exists
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });
  if (!customer) {
    return { success: false, message: "Customer not found." };
  }

  // 2. Check for duplicate bill for same month/year
  const existing = await prisma.bill.findUnique({
    where: {
      customerId_billingMonth_billingYear: {
        customerId,
        billingMonth,
        billingYear,
      },
    },
  });

  if (existing) {
    return {
      success: false,
      message: `A bill already exists for ${customer.customerCode} for month ${billingMonth}/${billingYear}.`,
    };
  }

  const dueDateTime = new Date(dueDate);
  const status = new Date() > dueDateTime ? BillStatus.OVERDUE : BillStatus.UNPAID;

  try {
    const bill = await prisma.bill.create({
      data: {
        customerId,
        billingMonth,
        billingYear,
        amount,
        dueDate: dueDateTime,
        status,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "BILL_CREATED",
      entityType: "Bill",
      entityId: bill.id,
      metadata: {
        customerCode: customer.customerCode,
        amount: amount.toString(),
        month: billingMonth,
        year: billingYear,
      },
    });

    revalidatePath("/admin/bills");
    revalidatePath("/admin/dashboard");
    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true, message: "Bill created successfully!", billId: bill.id };
  } catch (err: any) {
    console.error("Create bill error:", err);
    return { success: false, message: "Database error while creating bill." };
  }
}

export async function generateMonthlyBillsAction(data: any) {
  const session = await requireAdmin();

  const parsed = generateMonthlyBillsSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validation error" };
  }

  const { billingMonth, billingYear, dueDay } = parsed.data;

  try {
    const result = await BillService.generateMonthlyBills(
      billingMonth,
      billingYear,
      dueDay,
      session.userId
    );

    revalidatePath("/admin/bills");
    revalidatePath("/admin/dashboard");

    return {
      success: true,
      message: `Monthly bills generated! Created ${result.createdCount} new bill(s). ${result.skippedCount} customer(s) already had bills for this month.`,
      result,
    };
  } catch (err: any) {
    console.error("Generate bills error:", err);
    return { success: false, message: "Failed to generate monthly bills." };
  }
}

export async function syncOverdueBillsAction() {
  await requireAdmin();
  try {
    const count = await BillService.syncOverdueBills();
    revalidatePath("/admin/bills");
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Synced overdue bills. ${count} bill(s) marked OVERDUE.` };
  } catch (err) {
    return { success: false, message: "Failed to sync overdue bills." };
  }
}

