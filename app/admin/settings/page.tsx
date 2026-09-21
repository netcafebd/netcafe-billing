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
          hotline: settings.hotline || "16234",
          email: settings.email || "support@netcafe-bd.com",
          officeAddress: settings.officeAddress || "হাউজ #১২, রোড #০৪, ব্লক #বি, ঢাকা-১২১৬, বাংলাদেশ",
          bkashNumber: settings.bkashNumber,
          bkashQrCode: isDefaultOrMockQr(settings.bkashQrCode) ? "" : (settings.bkashQrCode || ""),
          paymentInstructions: settings.paymentInstructions || "",
          heroTitle: settings.heroTitle || "দ্রুততম গতিতে সংযোগ, নিরবচ্ছিন্ন ডিজিটাল জীবন",
          heroSubtitle: settings.heroSubtitle || "NETCAFE ফাইবার ব্রডব্যান্ড নিয়ে এলো বাফারলেস ৪K ভিডিও স্ট্রিমিং, ১০০+ এমবিপিএস BDIX স্পিড, সুপার লো-পিং গেমিং এবং সার্বক্ষণিক ২৪/৭ টেকনিক্যাল সাপোর্ট।",
          heroNotice: settings.heroNotice || "নতুন গ্রাহকদের জন্য ফ্রি ফাইবার ইনস্টলেশন অফার!",
          coverageArea: settings.coverageArea || "ঢাকা, সাভার, গাজীপুর, চট্টগ্রাম এবং সারা দেশজুড়ে বিস্তৃত নেটওয়ার্ক",
          packagesJson: settings.packagesJson || "[{\"name\":\"Regular Speed\",\"speed\":\"15 Mbps\",\"price\":500,\"bdix\":\"100 Mbps\"},{\"name\":\"Gaming Turbo\",\"speed\":\"25 Mbps\",\"price\":800,\"bdix\":\"100 Mbps\"},{\"name\":\"Super Speed\",\"speed\":\"40 Mbps\",\"price\":1200,\"bdix\":\"100 Mbps\"},{\"name\":\"Corporate Pro\",\"speed\":\"60 Mbps\",\"price\":1800,\"bdix\":\"100 Mbps\"}]",
          whyUsJson: settings.whyUsJson || "[{\"title\":\"১০০% রিয়েল অপটিক্যাল ফাইবার\",\"desc\":\"জিরো-ল্যাগ বাফারলেস নেটওয়ার্ক ও দ্রুততম ব্যান্ডউইথ\"},{\"title\":\"২৪/৭ ইনস্ট্যান্ট গ্রাহক সেবা\",\"desc\":\"১ মিনিটে হটলাইন রেসপন্স ও সার্বক্ষণিক প্রকৌশলী টিম\"},{\"title\":\"১০০ Mbps BDIX রকেট স্পিড\",\"desc\":\"বাফারলেস ইউটিউব, ফেসবুক ও ৪K স্ট্রিমিং\"},{\"title\":\"নিরাপদ ও বিটিআরসি নিবন্ধিত\",\"desc\":\"১০০% আইনি, নিরাপদ ও অনুমোদিত অপটিক্যাল সেবা\"}]",
          ftpServersJson: settings.ftpServersJson || "[{\"name\":\"BDIX Movie Server\",\"url\":\"http://ftp.netcafe-bd.com\",\"desc\":\"১০,০০০+ এইচডি মুভি ও টিভি সিরিজ (১০০ Mbps)\"},{\"name\":\"SamOnline FTP\",\"url\":\"http://samonline.tv\",\"desc\":\"হাই-স্পিড মিডিয়া ও লাইভ টিভি চ্যানেল\"},{\"name\":\"Live HD TV Server\",\"url\":\"http://tv.netcafe-bd.com\",\"desc\":\"১০০+ এইচডি ও ৪K লাইভ টেলিভিশন চ্যানেল\"}]",
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

