"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { customerCreateSchema, customerUpdateSchema } from "@/lib/validations/customer";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { logAuditEvent } from "@/lib/services/audit.service";
import { CustomerStatus, Role } from "@prisma/client";

export async function createCustomerAction(data: any) {
  const session = await requireAdmin();

  const parsed = customerCreateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validation failed" };
  }

  const { customerCode, name, phone, email, address, monthlyBill, connectionDate, status, initialPassword } = parsed.data;

  // 1. Check unique customer code
  const existingCode = await prisma.customer.findUnique({
    where: { customerCode: customerCode.toUpperCase() },
  });
  if (existingCode) {
    return { success: false, message: `Customer ID '${customerCode}' already exists.` };
  }

  // 2. Check unique phone
  const existingPhone = await prisma.customer.findUnique({
    where: { phone },
  });
  if (existingPhone) {
    return { success: false, message: `Phone number '${phone}' is already registered to another customer.` };
  }

  // 3. Check unique email if provided
  const userEmail = email && email.trim() !== "" ? email.trim().toLowerCase() : `${customerCode.toLowerCase()}@customer.isp`;
  const existingEmail = await prisma.user.findUnique({
    where: { email: userEmail },
  });
  if (existingEmail) {
    return { success: false, message: `Email '${userEmail}' is already in use by another account.` };
  }

  try {
    const passwordHash = await bcrypt.hash(initialPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: userEmail,
          passwordHash,
          role: Role.CUSTOMER,
        },
      });

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          customerCode: customerCode.toUpperCase(),
          name,
          phone,
          email: email || null,
          address,
          monthlyBill,
          status: status as CustomerStatus,
          connectionDate: connectionDate ? new Date(connectionDate) : new Date(),
        },
      });

      return customer;
    });

    await logAuditEvent({
      userId: session.userId,
      action: "CUSTOMER_CREATED",
      entityType: "Customer",
      entityId: result.id,
      metadata: {
        customerCode: result.customerCode,
        name: result.name,
        monthlyBill: result.monthlyBill.toString(),
      },
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Customer created successfully!", customerId: result.id };
  } catch (err: any) {
    console.error("Create customer error:", err);
    return { success: false, message: "Failed to create customer due to a database error." };
  }
}

export async function updateCustomerAction(customerId: string, data: any) {
  const session = await requireAdmin();

  const parsed = customerUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validation failed" };
  }

  const { name, phone, email, address, monthlyBill, status } = parsed.data;

  // Check phone uniqueness against other customers
  const existingPhone = await prisma.customer.findFirst({
    where: {
      phone,
      NOT: { id: customerId },
    },
  });
  if (existingPhone) {
    return { success: false, message: `Phone number '${phone}' is already used by customer ${existingPhone.customerCode}.` };
  }

  try {
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        name,
        phone,
        email: email || null,
        address,
        monthlyBill,
        status: status as CustomerStatus,
      },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "CUSTOMER_UPDATED",
      entityType: "Customer",
      entityId: customerId,
      metadata: { name, phone, status, monthlyBill: monthlyBill.toString() },
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);
    revalidatePath("/admin/dashboard");
    return { success: true, message: "Customer updated successfully!" };
  } catch (err: any) {
    console.error("Update customer error:", err);
    return { success: false, message: "Failed to update customer." };
  }
}

export async function updateCustomerStatusAction(customerId: string, status: CustomerStatus) {
  const session = await requireAdmin();

  try {
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: { status },
    });

    await logAuditEvent({
      userId: session.userId,
      action: `CUSTOMER_STATUS_${status}`,
      entityType: "Customer",
      entityId: customerId,
      metadata: { newStatus: status, customerCode: updated.customerCode },
    });

    revalidatePath("/admin/customers");
    revalidatePath(`/admin/customers/${customerId}`);
    revalidatePath("/admin/dashboard");
    return { success: true, message: `Customer status changed to ${status}.` };
  } catch (err) {
    return { success: false, message: "Failed to change customer status." };
  }
}

export async function resetCustomerPasswordAction(customerId: string, newPassword: string) {
  const session = await requireAdmin();

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: "Password must be at least 6 characters." };
  }

  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    select: { userId: true, customerCode: true },
  });

  if (!customer) {
    return { success: false, message: "Customer not found." };
  }

  try {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: customer.userId },
      data: { passwordHash },
    });

    await logAuditEvent({
      userId: session.userId,
      action: "CUSTOMER_PASSWORD_RESET",
      entityType: "Customer",
      entityId: customerId,
      metadata: { customerCode: customer.customerCode },
    });

    return { success: true, message: `Password reset successfully for ${customer.customerCode}.` };
  } catch (err) {
    return { success: false, message: "Failed to reset password." };
  }
}

