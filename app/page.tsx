import React from "react";
import { getSession } from "@/lib/auth/session";
import { LandingPageClient } from "@/components/landing/landing-page-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  try {
    let session = null;
    try {
      session = await getSession();
    } catch (_) {}

    const { prisma } = await import("@/lib/db/prisma");
    let settings = await prisma.iSPSettings.findFirst();
    if (!settings) {
      settings = await prisma.iSPSettings.create({
        data: {
          ispName: "NETCAFE Fiber Broadband",
          supportPhone: "+880 9612-000111",
          hotline: "16234",
          email: "support@netcafe-bd.com",
          officeAddress: "হাউজ #১২, রোড #০৪, ব্লক #বি, ঢাকা-১২১৬, বাংলাদেশ",
          bkashNumber: "01622280960",
          paymentInstructions: "1. Open bKash App\n2. Select 'Send Money'\n3. Enter ISP bKash Number\n4. Enter exact bill amount",
        },
      });
    }

    return <LandingPageClient settings={settings} session={session} />;
  } catch (error: any) {
    console.error("[CRITICAL] HomePage Error:", error);

    const fallbackSettings = {
      id: "default-isp-setting",
      ispName: "NETCAFE",
      supportPhone: "+880 1622280960",
      hotline: "16234",
      whatsappNumber: "8801622280960",
      email: "support@netcafe-bd.com",
      officeAddress: "হাউজ #১২, রোড #০৪, ব্লক #বি, ঢাকা-১২১৬, বাংলাদেশ",
      bkashNumber: "01622280960",
      bkashQrCode: "",
      paymentInstructions: "1. Open bKash App\n2. Select 'Send Money'\n3. Enter ISP bKash Number\n4. Enter exact bill amount\n5. Complete transaction\n6. Copy Transaction ID and submit here",
      heroTitle: "দ্রুততম গতিতে সংযোগ, নিরবচ্ছিন্ন ডিজিটাল জীবন",
      heroSubtitle: "NETCAFE ফাইবার ব্রডব্যান্ড নিয়ে এলো বাফারলেস ৪K ভিডিও স্ট্রিমিং, ১০০+ এমবিপিএস BDIX স্পিড, সুপার লো-পিং গেমিং এবং সার্বক্ষণিক ২৪/৭ টেকনিক্যাল সাপোর্ট।",
      heroNotice: "নতুন গ্রাহকদের জন্য ফ্রি ফাইবার ইনস্টলেশন অফার!",
      coverageArea: "ঢাকা, সাভার, গাজীপুর, চট্টগ্রাম এবং সারা দেশজুড়ে বিস্তৃত নেটওয়ার্ক",
      packagesJson: null,
      whyUsJson: null,
      ftpServersJson: null,
      coverageDataJson: null,
      testimonialsJson: null,
      corporatePartnersJson: null,
      footerAboutText: "NETCAFE দিচ্ছে আল্ট্রা-হাই স্পিড অপটিক্যাল ফাইবার ইন্টারনেট, BDIX ও লোকাল ক্যাশ সার্ভার এবং নিরবচ্ছিন্ন হোম ও এন্টারপ্রাইজ কানেক্টিভিটি।",
      btrcLicenseText: "লাইসেন্স নং: BTRC/ISP/NAT-2024/098",
      updatedAt: new Date(),
    };

    return <LandingPageClient settings={fallbackSettings as any} session={null} />;
  }
}
