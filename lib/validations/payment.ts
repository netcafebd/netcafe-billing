import { z } from "zod";

export const paymentSubmitSchema = z.object({
  billId: z.string().uuid("Invalid Bill ID"),
  senderPhone: z
    .string()
    .min(11, "Sender phone must be at least 11 digits")
    .regex(/^01[3-9]\d{8}$/, "Must be a valid Bangladeshi phone number (01XXXXXXXXX)"),
  transactionId: z
    .string()
    .min(5, "Transaction ID is required")
    .max(50)
    .trim()
    .toUpperCase(),
  notes: z.string().max(300).optional(),
});

export type PaymentSubmitInput = z.infer<typeof paymentSubmitSchema>;

export const paymentRejectSchema = z.object({
  paymentId: z.string().uuid("Invalid Payment ID"),
  rejectionReason: z
    .string()
    .min(3, "Please provide a reason for rejecting this payment")
    .max(500)
    .trim(),
});

export type PaymentRejectInput = z.infer<typeof paymentRejectSchema>;

