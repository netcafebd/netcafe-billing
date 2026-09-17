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

export async function updateAdminAccountAction(params: {
  newEmail?: string;
  currentPassword: string;
  newPassword?: string;
}) {
  const session = await requireAuth();

  if (!params.currentPassword) {
    return { success: false, message: "Current password is required to save changes." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) {
    return { success: false, message: "User account not found." };
  }

  // 1. Verify current password
  const isMatch = await bcrypt.compare(params.currentPassword, user.passwordHash);
  if (!isMatch) {
    return { success: false, message: "Current password is incorrect." };
  }

  const updateData: { email?: string; passwordHash?: string } = {};

  // 2. Handle email update
  if (params.newEmail && params.newEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
    const trimmedEmail = params.newEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return { success: false, message: "Please enter a valid email address." };
    }

    const existing = await prisma.user.findFirst({
      where: {
        email: trimmedEmail,
        NOT: { id: user.id },
      },
    });
    if (existing) {
      return { success: false, message: "This email address is already in use by another account." };
    }

    updateData.email = trimmedEmail;
  }

  // 3. Handle password update
  if (params.newPassword && params.newPassword.trim()) {
    if (params.newPassword.trim().length < 6) {
      return { success: false, message: "New password must be at least 6 characters long." };
    }
    updateData.passwordHash = await bcrypt.hash(params.newPassword.trim(), 10);
  }

  if (Object.keys(updateData).length === 0) {
    return { success: false, message: "No changes detected to update." };
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: updateData,
  });

  // Re-issue session cookie if email changed
  if (updateData.email) {
    await createSession({
      ...session,
      email: updatedUser.email,
    });
  }

  await logAuditEvent({
    userId: user.id,
    action: "ACCOUNT_SETTINGS_UPDATED",
    entityType: "User",
    entityId: user.id,
    metadata: {
      emailChanged: !!updateData.email,
      passwordChanged: !!updateData.passwordHash,
    },
  });

  return {
    success: true,
    message: updateData.email && updateData.passwordHash
      ? "Admin email and password updated successfully!"
      : updateData.email
      ? "Admin email updated successfully!"
      : "Admin password updated successfully!",
    newEmail: updatedUser.email,
  };
}

