import { z } from "zod";

export const settingsUpdateSchema = z.object({
  ispName: z.string().min(2, "ISP Name is required").trim(),
  supportPhone: z
    .string()
    .min(5, "Support Phone is required")
    .trim(),
  hotline: z.string().optional().default("16234"),
  whatsappNumber: z.string().optional().default("8801622280960"),
  email: z.string().optional().default("support@netcafe-bd.com"),
  officeAddress: z.string().optional().default(""),
  bkashNumber: z
    .string()
    .min(11, "bKash Number must be at least 11 digits")
    .regex(/^01[3-9]\d{8}$/, "Must be a valid Bangladeshi bKash number (01XXXXXXXXX)"),
  bkashQrCode: z.string().optional().default(""),
  paymentInstructions: z.string().min(10, "Payment instructions are required"),
  heroTitle: z.string().optional().default(""),
  heroSubtitle: z.string().optional().default(""),
  heroNotice: z.string().optional().default(""),
  coverageArea: z.string().optional().default(""),
  packagesJson: z.string().optional().default(""),
  whyUsJson: z.string().optional().default(""),
  ftpServersJson: z.string().optional().default(""),
});

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
