import { z } from "zod";

export const settingsUpdateSchema = z.object({
  ispName: z.string().min(2, "ISP Name is required").trim(),
  supportPhone: z
    .string()
    .min(5, "Support Phone is required")
    .trim(),
  bkashNumber: z
    .string()
    .min(11, "bKash Number must be at least 11 digits")
    .regex(/^01[3-9]\d{8}$/, "Must be a valid Bangladeshi bKash number (01XXXXXXXXX)"),
  bkashQrCode: z.string().optional().default(""),
  paymentInstructions: z.string().min(10, "Payment instructions are required"),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;

