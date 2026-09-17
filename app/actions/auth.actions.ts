"use server";

import { prisma } from "@/lib/db/prisma";
import { createSession, clearSession, requireAuth } from "@/lib/auth/session";
import { loginSchema, changePasswordSchema } from "@/lib/validations/auth";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { logAuditEvent } from "@/lib/services/audit.service";

export async function loginAction(formData: FormData | Record<string, any>) {
  try {
    const rawData = formData instanceof FormData
      ? Object.fromEntries(formData.entries())
      : formData;

    const parsed = loginSchema.safeParse(rawData);
    if (!parsed.success) {
      return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
    }

    const { identifier, password } = parsed.data;

    // Search for user by:
    // 1. Exact email
    // 2. Customer code
    // 3. Customer phone
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          {
            customer: {
              OR: [
                { customerCode: identifier.toUpperCase() },
                { phone: identifier },
              ],
            },
          },
        ],
      },
      include: {
        customer: true,
      },
    });

    if (!user) {
      return { success: false, message: "Invalid credentials. Please check your details." };
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, message: "Invalid credentials. Please check your password." };
    }

    // If customer, check account status
    if (user.role === "CUSTOMER" && user.customer) {
      if (user.customer.status === "SUSPENDED") {
        return {
          success: false,
          message: "Your internet account has been suspended. Please contact ISP support.",
        };
      }
      if (user.customer.status === "INACTIVE") {
        return {
          success: false,
          message: "Your account is currently inactive. Please contact ISP support.",
        };
      }
    }

    // Set session cookie
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      customerId: user.customer?.id,
      name: user.customer?.name || "Administrator",
      customerCode: user.customer?.customerCode,
    });

    return {
      success: true,
      role: user.role,
      redirectUrl: user.role === "ADMIN" ? "/admin/dashboard" : "/portal/dashboard",
    };
  } catch (error: any) {
    console.error("Login error:", error);
    return { success: false, message: "An unexpected error occurred during login." };
  }
}

export async function logoutAction() {
  await clearSession();
  redirect("/login");
}

export async function changePasswordAction(formData: FormData | Record<string, any>) {
  const session = await requireAuth();

  const rawData = formData instanceof FormData
    ? Object.fromEntries(formData.entries())
    : formData;

  const parsed = changePasswordSchema.safeParse(rawData);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid input" };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return { success: false, message: "User not found" };
  }

  const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isMatch) {
    return { success: false, message: "Current password is incorrect" };
  }

  const newHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: newHash },
  });

  await logAuditEvent({
    userId: session.userId,
    action: "PASSWORD_CHANGED",
    entityType: "User",
    entityId: session.userId,
  });

  return { success: true, message: "Password changed successfully!" };
}

