"use client";

import React, { useState } from "react";
import { LanguageProvider } from "./language-context";
import { Navbar } from "./navbar";
import { Hero } from "./hero";
import { BillSearchWidget } from "./bill-search-widget";
import { PackagePlans } from "./package-plans";
import { CoverageChecker } from "./coverage-checker";
import { ValueAddedServices } from "./value-added-services";
import { Features } from "./features";
import { Testimonials } from "./testimonials";
import { ContactSection } from "./contact-section";
import { OrderModal } from "./order-modal";
import { Wifi, PhoneCall, Mail, MapPin, ShieldCheck } from "lucide-react";

interface LandingPageClientProps {
  settings: any;
  session: any;
}

export function LandingPageClient({ settings, session }: LandingPageClientProps) {
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [selectedArea, setSelectedArea] = useState<string>("");

  const handleOpenOrder = (pkg?: any, area?: string) => {
    if (pkg) setSelectedPackage(pkg);
    if (area) setSelectedArea(area);
    setIsOrderModalOpen(true);
  };

  const selfCareHref = session
    ? session.role === "ADMIN"
      ? "/admin/dashboard"
      : "/portal/dashboard"
    : "/login";

  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen bg-[#080d1a] text-slate-100 font-sans overflow-x-hidden">
        {/* Top Navbar */}
        <Navbar
          hotline={settings?.hotline || "16234"}
          selfCareHref={selfCareHref}
          isLoggedIn={!!session}
          onOpenOrderModal={() => handleOpenOrder()}
        />

        <main className="flex-1">
          {/* Hero Section */}
          <Hero
            onOpenOrder={() => handleOpenOrder()}
            heroNotice={settings?.heroNotice}
            heroTitle={settings?.heroTitle}
            heroSubtitle={settings?.heroSubtitle}
            ispName={settings?.ispName}
          />

          {/* Bill Search & Instant Payment Section */}
          <section id="pay-bill" className="py-16 bg-slate-950/60 border-y border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <BillSearchWidget />
            </div>
          </section>

          {/* Packages Grid Section */}
          <PackagePlans
            onSelectPackage={(pkg) => handleOpenOrder(pkg)}
            customPackagesJson={settings?.packagesJson}
            hotline={settings?.hotline}
          />

          {/* Coverage Area Section */}
          <CoverageChecker
            onOpenOrderWithArea={(area) => handleOpenOrder(undefined, area)}
            customCoverageText={settings?.coverageArea}
            hotline={settings?.hotline}
          />

          {/* Value Added Services / FTP Section */}
          <ValueAddedServices customFtpJson={settings?.ftpServersJson} />

          {/* Why Choose Us Features Section */}
          <Features customWhyUsJson={settings?.whyUsJson} />

          {/* Customer Testimonials & Corporate Clients Showcase */}
          <Testimonials />

          {/* Contact Us Section */}
          <ContactSection
            hotline={settings?.hotline}
            supportPhone={settings?.supportPhone}
            email={settings?.email}
            officeAddress={settings?.officeAddress}
          />
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 px-4 sm:px-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800/80">
            {/* Col 1: Brand Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-orange-500 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center">
                    <Wifi className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <span className="text-xl font-black text-white">NET</span>
                    <span className="text-xl font-black text-orange-400">CAFE</span>
                  </div>
                  <span className="text-[9px] tracking-widest uppercase font-semibold text-indigo-400 -mt-1">
                    FIBER BROADBAND
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
                NETCAFE দিচ্ছে আল্ট্রা-হাই স্পিড অপটিক্যাল ফাইবার ইন্টারনেট, BDIX ও লোকাল ক্যাশ সার্ভার এবং নিরবচ্ছিন্ন হোম ও এন্টারপ্রাইজ কানেক্টিভিটি।
              </p>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-slate-300">
                <p className="font-bold text-orange-400 flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> BTRC লাইসেন্সপ্রাপ্ত আইএসপি
                </p>
                <p className="text-[11px] text-slate-400">লাইসেন্স নং: BTRC/ISP/NAT-2024/098</p>
              </div>
            </div>

            {/* Col 2: Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">গুরুত্বপূর্ণ লিংক</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#packages" className="hover:text-white transition">ইন্টারনেট প্যাকেজসমূহ</a></li>
                <li><a href="#pay-bill" className="hover:text-white transition">অনলাইন বিল পেমেন্ট</a></li>
                <li><a href="#coverage" className="hover:text-white transition">কভারেজ এরিয়া চেক</a></li>
                <li><a href="#vas" className="hover:text-white transition">FTP ও লাইভ টিভি পোর্টাল</a></li>
                <li><button onClick={() => handleOpenOrder()} className="hover:text-orange-400 transition text-left">নতুন সংযোগ আবেদন</button></li>
              </ul>
            </div>

            {/* Col 3: Services */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">সার্ভিসেস</h4>
              <ul className="space-y-2 text-slate-400">
                <li>হোম ফাইবার ব্রডব্যান্ড (FTTH)</li>
                <li>কর্পোরেট ডেডিকেটেড ১:১ লাইন</li>
                <li>গেমিং লো-পিং অপটিমাইজেশন</li>
                <li>মাল্টি-হোমিং ও BGP রাউটিং</li>
                <li>ক্লাউড সিকিউরিটি ও আইপি সলিউশন</li>
                <li>২৪/৭ কাস্টমার সাপোর্ট</li>
              </ul>
            </div>

            {/* Col 4: Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">যোগাযোগ</h4>
              <ul className="space-y-2.5 text-slate-400">
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-orange-400 shrink-0" />
                  <span>{settings?.hotline || "১৬২৩৪"} (হটলাইন)</span>
                </li>
                <li className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>{settings?.supportPhone || "+880 9611 800 800"}</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{settings?.email || "support@netcafebd.com"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{settings?.officeAddress || "লেভেল-৭, টাওয়ার-এ, গুলশান সাউথ এভিনিউ, গুলশান-২, ঢাকা-১২১২"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Footer Credits & Payment Partners */}
          <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400">
            <p className="text-xs text-center md:text-left">
              © {new Date().getFullYear()} NETCAFE Network Limited. সর্বস্বত্ব সংরক্ষিত।
            </p>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">অনুমোদিত পেমেন্ট পার্টনার:</span>
              <div className="flex items-center gap-2 font-bold text-slate-300 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-pink-400">bKash</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-orange-400">Nagad</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-purple-400">Rocket</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-blue-400">VISA / Master</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Order Connection Modal */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          initialPackage={selectedPackage}
          initialArea={selectedArea}
          hotline={settings?.hotline || "16234"}
        />
      </div>
    </LanguageProvider>
  );
}
