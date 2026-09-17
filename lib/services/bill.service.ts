import { prisma } from "@/lib/db/prisma";
import { BillStatus } from "@prisma/client";
import { logAuditEvent } from "./audit.service";

export class BillService {
  /**
   * Syncs overdue status for bills whose dueDate has passed and are still UNPAID.
   * Does NOT modify PAID or PAYMENT_SUBMITTED bills.
   */
  static async syncOverdueBills(): Promise<number> {
    const now = new Date();
    const result = await prisma.bill.updateMany({
      where: {
        status: BillStatus.UNPAID,
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: BillStatus.OVERDUE,
      },
    });
    return result.count;
  }

  /**
   * Generates monthly bills for all ACTIVE customers who do not already have a bill for that month/year.
   */
  static async generateMonthlyBills(
    month: number,
    year: number,
    dueDay: number = 10,
    adminUserId?: string
  ): Promise<{ createdCount: number; skippedCount: number }> {
    // 1. Fetch active customers
    const activeCustomers = await prisma.customer.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, monthlyBill: true, customerCode: true },
    });

    if (activeCustomers.length === 0) {
      return { createdCount: 0, skippedCount: 0 };
    }

    // 2. Fetch existing bills for this month/year
    const existingBills = await prisma.bill.findMany({
      where: {
        billingMonth: month,
        billingYear: year,
      },
      select: { customerId: true },
    });

    const existingCustomerIds = new Set(existingBills.map((b) => b.customerId));

    // 3. Filter customers who need a bill
    const customersToBill = activeCustomers.filter(
      (c) => !existingCustomerIds.has(c.id)
    );

    if (customersToBill.length === 0) {
      return { createdCount: 0, skippedCount: activeCustomers.length };
    }

    // Due date is dueDay of the specified month/year at 23:59:59 (Asia/Dhaka time)
    const dueDate = new Date(Date.UTC(year, month - 1, dueDay, 18, 0, 0)); // 18:00 UTC = 24:00 Dhaka

    // Determine initial status based on due date
    const initialStatus =
      new Date() > dueDate ? BillStatus.OVERDUE : BillStatus.UNPAID;

    // 4. Batch create bills
    await prisma.bill.createMany({
      data: customersToBill.map((c) => ({
        customerId: c.id,
        billingMonth: month,
        billingYear: year,
        amount: c.monthlyBill,
        dueDate,
        status: initialStatus,
      })),
      skipDuplicates: true,
    });

    // 5. Audit Log
    await logAuditEvent({
      userId: adminUserId,
      action: "BILLS_GENERATED",
      entityType: "Bill",
      metadata: {
        month,
        year,
        createdCount: customersToBill.length,
        skippedCount: existingCustomerIds.size,
      },
    });

    return {
      createdCount: customersToBill.length,
      skippedCount: existingCustomerIds.size,
    };
  }

  /**
   * Retrieves the current active bill for a customer.
   * Priority: PAYMENT_SUBMITTED > OVERDUE > UNPAID > latest bill
   */
  static async getCurrentBill(customerId: string) {
    // Check for pending/unpaid bills
    const priorityBill = await prisma.bill.findFirst({
      where: {
        customerId,
        status: {
          in: [
            BillStatus.PAYMENT_SUBMITTED,
            BillStatus.OVERDUE,
            BillStatus.UNPAID,
          ],
        },
      },
      orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }],
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (priorityBill) return priorityBill;

    // Otherwise return the most recent bill (e.g. PAID)
    return await prisma.bill.findFirst({
      where: { customerId },
      orderBy: [{ billingYear: "desc" }, { billingMonth: "desc" }],
      include: {
        payments: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  }
}

