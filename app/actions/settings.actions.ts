"use server";

import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { settingsUpdateSchema } from "@/lib/validations/settings";
import { logAuditEvent } from "@/lib/services/audit.service";
import { revalidatePath } from "next/cache";

export async function updateISPSettingsAction(data: any) {
  const session = await requireAdmin();

  const parsed = settingsUpdateSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Validation failed" };
  }

  const {
    ispName,
    supportPhone,
    hotline,
    bkashNumber,
    bkashQrCode,
    paymentInstructions,
    heroTitle,
    heroSubtitle,
    heroNotice,
    coverageArea,
    packagesJson,
  } = parsed.data;

  try {
    const existing = await prisma.iSPSettings.findFirst();

    let updated;
    if (existing) {
      updated = await prisma.iSPSettings.update({
        where: { id: existing.id },
        data: {
          ispName,
          supportPhone,
          hotline,
          bkashNumber,
          bkashQrCode,
          paymentInstructions,
          heroTitle,
          heroSubtitle,
          heroNotice,
          coverageArea,
          packagesJson,
        },
      });
    } else {
      updated = await prisma.iSPSettings.create({
        data: {
          ispName,
          supportPhone,
          hotline,
          bkashNumber,
          bkashQrCode,
          paymentInstructions,
          heroTitle,
          heroSubtitle,
          heroNotice,
          coverageArea,
          packagesJson,
        },
      });
    }

    await logAuditEvent({
      userId: session.userId,
      action: "SETTINGS_UPDATED",
      entityType: "ISPSettings",
      entityId: updated.id,
      metadata: { ispName, supportPhone, bkashNumber, hotline },
    });

    revalidatePath("/");
    revalidatePath("/admin/settings");
    revalidatePath("/portal/pay-bill");
    return { success: true, message: "ISP & website settings updated successfully!" };
  } catch (err: any) {
    console.error("Update settings error:", err);
    return { success: false, message: "Failed to update ISP settings." };
  }
}

