"use server";

import { requireAdmin, requireCustomer } from "@/lib/auth/session";
import { paymentSubmitSchema, paymentRejectSchema } from "@/lib/validations/payment";
import { paymentService } from "@/lib/services/payment.service";
import { revalidatePath } from "next/cache";

export async function submitPaymentAction(data: any) {
  const session = await requireCustomer();

  const parsed = paymentSubmitSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validation failed" };
  }

  const result = await paymentService.submitPayment(session.customerId, {
    billId: parsed.data.billId,
    senderPhone: parsed.data.senderPhone,
    transactionId: parsed.data.transactionId,
    notes: parsed.data.notes,
  });

  if (result.success) {
    revalidatePath("/portal/dashboard");
    revalidatePath("/portal/bills");
    revalidatePath("/portal/payments");
    revalidatePath("/portal/pay-bill");
    revalidatePath("/admin/payments");
    revalidatePath("/admin/bills");
  }

  return result;
}

export async function verifyPaymentAction(paymentId: string) {
  const session = await requireAdmin();

  if (!paymentId) {
    return { success: false, message: "Payment ID is required" };
  }

  const result = await paymentService.verifyPayment(session.userId, paymentId);

  if (result.success) {
    revalidatePath("/admin/payments");
    revalidatePath("/admin/bills");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");
    revalidatePath("/portal/dashboard");
    revalidatePath("/portal/bills");
    revalidatePath("/portal/payments");
  }

  return result;
}

export async function rejectPaymentAction(data: any) {
  const session = await requireAdmin();

  const parsed = paymentRejectSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validation failed" };
  }

  const result = await paymentService.rejectPayment(
    session.userId,
    parsed.data.paymentId,
    parsed.data.rejectionReason
  );

  if (result.success) {
    revalidatePath("/admin/payments");
    revalidatePath("/admin/bills");
    revalidatePath("/admin/dashboard");
    revalidatePath("/admin/reports");
    revalidatePath("/portal/dashboard");
    revalidatePath("/portal/bills");
    revalidatePath("/portal/payments");
  }

  return result;
}

