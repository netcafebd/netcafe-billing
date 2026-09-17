import { prisma } from "@/lib/db/prisma";
import { BillStatus, PaymentMethod, PaymentStatus } from "@prisma/client";
import { logAuditEvent } from "./audit.service";

export interface SubmitPaymentDTO {
  billId: string;
  senderPhone: string;
  transactionId: string;
  notes?: string;
}

export interface IPaymentService {
  submitPayment(customerId: string, dto: SubmitPaymentDTO): Promise<{ success: boolean; message: string; paymentId?: string }>;
  verifyPayment(adminUserId: string, paymentId: string): Promise<{ success: boolean; message: string }>;
  rejectPayment(adminUserId: string, paymentId: string, rejectionReason: string): Promise<{ success: boolean; message: string }>;
}

export class ManualBkashPaymentService implements IPaymentService {
  /**
   * Customer submits a manual bKash transaction ID
   */
  async submitPayment(customerId: string, dto: SubmitPaymentDTO) {
    const cleanTrx = dto.transactionId.trim().toUpperCase();

    // 1. Verify bill belongs to customer
    const bill = await prisma.bill.findUnique({
      where: { id: dto.billId },
      include: { customer: true },
    });

    if (!bill) {
      return { success: false, message: "Bill not found" };
    }

    if (bill.customerId !== customerId) {
      return { success: false, message: "Unauthorized: You do not own this bill" };
    }

    if (bill.status === BillStatus.PAID) {
      return { success: false, message: "This bill is already paid" };
    }

    // 2. Check duplicate Transaction ID
    const existingTrx = await prisma.payment.findUnique({
      where: { transactionId: cleanTrx },
    });

    if (existingTrx) {
      return {
        success: false,
        message: "This bKash Transaction ID has already been submitted in the system",
      };
    }

    // 3. Database transaction: create payment & mark bill PAYMENT_SUBMITTED
    const payment = await prisma.$transaction(async (tx) => {
      const newPayment = await tx.payment.create({
        data: {
          billId: bill.id,
          customerId: bill.customerId,
          amount: bill.amount,
          method: PaymentMethod.BKASH,
          transactionId: cleanTrx,
          senderPhone: dto.senderPhone.trim(),
          status: PaymentStatus.PENDING,
          notes: dto.notes?.trim() || null,
        },
      });

      await tx.bill.update({
        where: { id: bill.id },
        data: {
          status: BillStatus.PAYMENT_SUBMITTED,
        },
      });

      return newPayment;
    });

    await logAuditEvent({
      userId: bill.customer.userId,
      action: "PAYMENT_SUBMITTED",
      entityType: "Payment",
      entityId: payment.id,
      metadata: {
        transactionId: cleanTrx,
        amount: bill.amount.toString(),
        billId: bill.id,
      },
    });

    return {
      success: true,
      message: "Payment submitted successfully. Your payment is waiting for verification.",
      paymentId: payment.id,
    };
  }

  /**
   * Admin verifies the bKash payment after external confirmation
   */
  async verifyPayment(adminUserId: string, paymentId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { bill: true, customer: true },
    });

    if (!payment) {
      return { success: false, message: "Payment record not found" };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return {
        success: false,
        message: `Payment cannot be verified because current status is ${payment.status}`,
      };
    }

    const now = new Date();

    // Concurrency safe transaction: update payment & mark bill PAID
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.VERIFIED,
          verifiedAt: now,
          verifiedBy: adminUserId,
        },
      });

      await tx.bill.update({
        where: { id: payment.billId },
        data: {
          status: BillStatus.PAID,
          paidAt: now,
        },
      });
    });

    await logAuditEvent({
      userId: adminUserId,
      action: "PAYMENT_VERIFIED",
      entityType: "Payment",
      entityId: paymentId,
      metadata: {
        transactionId: payment.transactionId,
        amount: payment.amount.toString(),
        billId: payment.billId,
        customerId: payment.customerId,
      },
    });

    return {
      success: true,
      message: "Payment verified successfully. Bill has been marked as PAID.",
    };
  }

  /**
   * Admin rejects an invalid/fake payment submission
   */
  async rejectPayment(adminUserId: string, paymentId: string, rejectionReason: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { bill: true },
    });

    if (!payment) {
      return { success: false, message: "Payment record not found" };
    }

    if (payment.status !== PaymentStatus.PENDING) {
      return {
        success: false,
        message: `Payment cannot be rejected because current status is ${payment.status}`,
      };
    }

    const now = new Date();
    // Determine new bill status: OVERDUE if dueDate < now, otherwise UNPAID
    const newBillStatus =
      now > payment.bill.dueDate ? BillStatus.OVERDUE : BillStatus.UNPAID;

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REJECTED,
          rejectionReason: rejectionReason.trim(),
        },
      });

      await tx.bill.update({
        where: { id: payment.billId },
        data: {
          status: newBillStatus,
        },
      });
    });

    await logAuditEvent({
      userId: adminUserId,
      action: "PAYMENT_REJECTED",
      entityType: "Payment",
      entityId: paymentId,
      metadata: {
        transactionId: payment.transactionId,
        rejectionReason: rejectionReason.trim(),
        newBillStatus,
      },
    });

    return {
      success: true,
      message: `Payment rejected. Bill status reverted to ${newBillStatus}.`,
    };
  }
}

// Export singleton instance of current payment provider
export const paymentService: IPaymentService = new ManualBkashPaymentService();

