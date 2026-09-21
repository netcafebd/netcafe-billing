import React from "react";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { LandingPageClient } from "@/components/landing/landing-page-client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();

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
}
