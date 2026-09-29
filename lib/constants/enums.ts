// Safe enums bundled directly with Webpack to prevent undefined errors on runtime environments
export const CustomerStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type CustomerStatus = (typeof CustomerStatus)[keyof typeof CustomerStatus];

export const BillStatus = {
  UNPAID: "UNPAID",
  PAYMENT_SUBMITTED: "PAYMENT_SUBMITTED",
  PAID: "PAID",
  OVERDUE: "OVERDUE",
  CANCELLED: "CANCELLED",
} as const;
export type BillStatus = (typeof BillStatus)[keyof typeof BillStatus];

export const PaymentStatus = {
  PENDING: "PENDING",
  VERIFIED: "VERIFIED",
  REJECTED: "REJECTED",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const Role = {
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export const PaymentMethod = {
  BKASH: "BKASH",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];
