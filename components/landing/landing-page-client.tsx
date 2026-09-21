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
import { ContactSection } from "./contact-section";
import { OrderModal } from "./order-modal";

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
          hotline={settings?.hotline}
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

          {/* Bill Search & Pay Section */}
          <section id="pay-bill" className="py-16 bg-slate-950/60 border-y border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
              <BillSearchWidget />
            </div>
          </section>

          {/* Packages Grid Section */}
          <PackagePlans
            onSelectPackage={(pkg) => handleOpenOrder(pkg)}
            customPackagesJson={settings?.packagesJson}
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

          {/* Contact Us Section */}
          <ContactSection
            hotline={settings?.hotline}
            supportPhone={settings?.supportPhone}
            email={settings?.email}
            officeAddress={settings?.officeAddress}
          />
        </main>

        {/* Footer */}
        <footer className="bg-slate-950 border-t border-slate-800/80 py-12 px-4 sm:px-8 text-xs text-slate-400">
          <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl font-black text-white">NET</span>
                <span className="text-xl font-black text-orange-400">CAFE</span>
              </div>
              <p className="text-slate-400 text-xs">
                স্বত্বাধিকার © {new Date().getFullYear()} {settings?.ispName || "NETCAFE Fiber Broadband"}। সর্বস্বত্ব সংরক্ষিত।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6">
              <a href="#hero" className="hover:text-white transition">হোম</a>
              <a href="#packages" className="hover:text-white transition">প্যাকেজসমূহ</a>
              <a href="#coverage" className="hover:text-white transition">কভারেজ</a>
              <a href={`tel:${settings?.hotline || "16234"}`} className="hover:text-white transition font-semibold text-orange-400">
                হটলাইন: {settings?.hotline || "16234"}
              </a>
              <a href={selfCareHref} className="hover:text-orange-400 transition font-semibold">
                সেলফ-কেয়ার লগইন
              </a>
            </div>
          </div>
        </footer>

        {/* Order Connection Modal */}
        <OrderModal
          isOpen={isOrderModalOpen}
          onClose={() => setIsOrderModalOpen(false)}
          initialPackage={selectedPackage}
          initialArea={selectedArea}
          hotline={settings?.hotline}
        />
      </div>
    </LanguageProvider>
  );
}
