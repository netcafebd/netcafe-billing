import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { SettingsForm } from "./settings-form";
import { AdminPasswordForm } from "@/components/admin/admin-password-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock } from "lucide-react";
import { isDefaultOrMockQr } from "@/lib/constants/qr";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const session = await requireAdmin();

  let settings = await prisma.iSPSettings.findFirst();

  if (!settings) {
    settings = await prisma.iSPSettings.create({
      data: {
        ispName: "NETCAFE",
        supportPhone: "+880 9612-000111",
        bkashNumber: "01622280960",
        bkashQrCode: "/images/bkash-qr.png",
        paymentInstructions: "1. Open your bKash App\n2. Select 'Send Money'\n3. Enter ISP bKash Number\n4. Enter exact bill amount\n5. Submit Transaction ID in portal",
      },
    });
  }

  return (
    <div className="space-y-8">
      <AdminHeader
        title="ISP Settings & Security"
        description="Configure your ISP branding, bKash receiving number, payment guidelines, and update your administrator credentials."
      />

      <SettingsForm
        initialSettings={{
          ispName: settings.ispName,
          supportPhone: settings.supportPhone,
          bkashNumber: settings.bkashNumber,
          bkashQrCode: isDefaultOrMockQr(settings.bkashQrCode) ? "" : (settings.bkashQrCode || ""),
          paymentInstructions: settings.paymentInstructions || "",
        }}
      />

      {/* Admin Security & Account Change Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="h-5 w-5 text-blue-600" />
            Admin Account & Security Settings
          </CardTitle>
          <CardDescription>
            Change your administrator login email address and password to keep your ISP billing system secure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminPasswordForm initialEmail={session.email} />
        </CardContent>
      </Card>
    </div>
  );
}

