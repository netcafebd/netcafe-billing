"use server";

import { prisma } from "@/lib/db/prisma";
import { revalidatePath } from "next/cache";

// Submit New Connection Application Request (Public Landing Page)
export async function submitConnectionRequestAction(data: {
  name: string;
  phone: string;
  packageName?: string;
  area?: string;
  address?: string;
}) {
  try {
    if (!data.name || !data.phone) {
      return { success: false, message: "Name and Phone number are required." };
    }

    const referenceCode = "CONN-" + Math.floor(100000 + Math.random() * 900000);

    const request = await prisma.connectionRequest.create({
      data: {
        referenceCode,
        name: data.name.trim(),
        phone: data.phone.trim(),
        packageName: data.packageName || "Default Package",
        area: data.area || "",
        address: data.address || "",
        status: "PENDING",
      },
    });

    revalidatePath("/admin/connection-requests");
    return { success: true, referenceCode: request.referenceCode };
  } catch (error: any) {
    console.error("submitConnectionRequestAction error:", error);
    return { success: false, message: error?.message || "Failed to submit request." };
  }
}

// Submit Contact Message / Helpdesk SMS (Public Landing Page)
export async function submitContactMessageAction(data: {
  name: string;
  phone: string;
  subject?: string;
  message: string;
}) {
  try {
    if (!data.name || !data.phone || !data.message) {
      return { success: false, message: "Name, Phone and Message details are required." };
    }

    await prisma.contactMessage.create({
      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        subject: data.subject || "General Query",
        message: data.message.trim(),
        status: "UNREAD",
      },
    });

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    console.error("submitContactMessageAction error:", error);
    return { success: false, message: error?.message || "Failed to send message." };
  }
}

// Admin: Update Connection Request Status
export async function updateConnectionRequestStatusAction(id: string, status: string, notes?: string) {
  try {
    await prisma.connectionRequest.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined ? { notes } : {}),
      },
    });

    revalidatePath("/admin/connection-requests");
    return { success: true };
  } catch (error: any) {
    console.error("updateConnectionRequestStatusAction error:", error);
    return { success: false, message: error?.message || "Failed to update status." };
  }
}

// Admin: Delete Connection Request
export async function deleteConnectionRequestAction(id: string) {
  try {
    await prisma.connectionRequest.delete({
      where: { id },
    });

    revalidatePath("/admin/connection-requests");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to delete request." };
  }
}

// Admin: Update Contact Message Status
export async function updateContactMessageStatusAction(id: string, status: string) {
  try {
    await prisma.contactMessage.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    console.error("updateContactMessageStatusAction error:", error);
    return { success: false, message: error?.message || "Failed to update status." };
  }
}

// Admin: Delete Contact Message
export async function deleteContactMessageAction(id: string) {
  try {
    await prisma.contactMessage.delete({
      where: { id },
    });

    revalidatePath("/admin/messages");
    return { success: true };
  } catch (error: any) {
    return { success: false, message: error?.message || "Failed to delete message." };
  }
}

