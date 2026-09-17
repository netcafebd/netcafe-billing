import { z } from "zod";

export const billCreateSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  billingMonth: z.coerce.number().int().min(1).max(12),
  billingYear: z.coerce.number().int().min(2020).max(2100),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
});

export type BillCreateInput = z.infer<typeof billCreateSchema>;

export const generateMonthlyBillsSchema = z.object({
  billingMonth: z.coerce.number().int().min(1).max(12),
  billingYear: z.coerce.number().int().min(2020).max(2100),
  dueDay: z.coerce.number().int().min(1).max(28).default(10),
});

export type GenerateMonthlyBillsInput = z.infer<typeof generateMonthlyBillsSchema>;

