import { z } from "zod";

export const customerCreateSchema = z.object({
  customerCode: z
    .string()
    .min(3, "Customer ID must be at least 3 characters")
    .max(30)
    .trim(),
  name: z.string().min(2, "Full name is required").trim(),
  phone: z
    .string()
    .min(11, "Phone number must be at least 11 digits")
    .max(15)
    .regex(/^01[3-9]\d{8}$/, "Must be a valid Bangladeshi phone number (e.g. 017XXXXXXXX)"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().min(3, "Address is required").trim(),
  monthlyBill: z
    .coerce
    .number()
    .positive("Monthly bill must be greater than 0"),
  connectionDate: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).default("ACTIVE"),
  initialPassword: z
    .string()
    .min(6, "Initial password must be at least 6 characters"),
});

export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;

export const customerUpdateSchema = z.object({
  name: z.string().min(2, "Full name is required").trim(),
  phone: z
    .string()
    .regex(/^01[3-9]\d{8}$/, "Must be a valid Bangladeshi phone number (e.g. 017XXXXXXXX)"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().min(3, "Address is required").trim(),
  monthlyBill: z
    .coerce
    .number()
    .positive("Monthly bill must be greater than 0"),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]),
});

export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;

