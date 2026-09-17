import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await requireAdmin();

  let settings = await prisma.iSPSettings.findFirst();

  if (!settings) {
    settings = await prisma.iSPSettings.create({
      data: {
        ispName: "BengalNet Broadband & Fiber",
        supportPhone: "+880 9612-000111",
        bkashNumber: "01799887766",
        bkashQrCode: "",
        paymentInstructions: "1. Open your bKash App\n2. Select 'Send Money'\n3. Enter ISP bKash Number\n4. Enter exact bill amount\n5. Submit Transaction ID in portal",
      },
    });
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="ISP Billing & Payment Settings"
        description="Configure your ISP branding, support line, bKash merchant/agent/personal receiving number and payment guidelines."
      />

      <SettingsForm
        initialSettings={{
          ispName: settings.ispName,
          supportPhone: settings.supportPhone,
          bkashNumber: settings.bkashNumber,
          bkashQrCode: settings.bkashQrCode,
          paymentInstructions: settings.paymentInstructions,
        }}
      />
    </div>
  );
}

