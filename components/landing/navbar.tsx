"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useLanguage } from "./language-context";
import { Wifi, PhoneCall, Globe, User, Zap, Menu, X, ShieldCheck } from "lucide-react";

interface NavbarProps {
  hotline?: string;
  selfCareHref: string;
  isLoggedIn: boolean;
  onOpenOrderModal: () => void;
}

export function Navbar({ hotline, selfCareHref, isLoggedIn, onOpenOrderModal }: NavbarProps) {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 text-xs text-slate-300 py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {t({ bn: "২৪/৭ নিরবচ্ছিন্ন সেবা", en: "24/7 Uninterrupted Service" })}
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              {t({ bn: "BTRC অনুমোদিত অপটিক্যাল ফাইবার নেটওয়ার্ক", en: "BTRC Approved Optical Fiber Network" })}
            </span>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <a
              href={`tel:${hotline || "16234"}`}
              className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-semibold transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t({ bn: `হটলাইন: ${hotline || "১৬২৩৪"}`, en: `Hotline: ${hotline || "16234"}` })}</span>
            </a>

            <span className="text-slate-700">|</span>

            {/* Language Switcher */}
            <button
              onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
              title="Toggle Language"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{language === "bn" ? "EN" : "বাংলা"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/60 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-orange-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition transform">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Wifi className="w-5 h-5 text-orange-400 group-hover:text-indigo-400 transition" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center">
                <span className="text-2xl font-black tracking-wider text-white">NET</span>
                <span className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  CAFE
                </span>
              </div>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-indigo-400 -mt-1">
                FIBER BROADBAND
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a href="#hero" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              {t({ bn: "হোম", en: "Home" })}
            </a>
            <a href="#packages" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              {t({ bn: "প্যাকেজসমূহ", en: "Packages" })}
            </a>
            <a href="#pay-bill" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              {t({ bn: "বিল পরিশোধ", en: "Pay Bill" })}
            </a>
            <a href="#coverage" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              {t({ bn: "কভারেজ এরিয়া", en: "Coverage" })}
            </a>
            <a href="#vas" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              {t({ bn: "এফটিপি ও মিডিয়া", en: "FTP & Media" })}
            </a>
            <a href="#why-us" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              {t({ bn: "কেন আমরা", en: "Why Us" })}
            </a>
            <a href="#contact" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              {t({ bn: "যোগাযোগ", en: "Contact" })}
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href={selfCareHref}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t({ bn: isLoggedIn ? "পোর্টালে যান" : "সেলফ-কেয়ার লগইন", en: isLoggedIn ? "Dashboard" : "Self-Care Login" })}</span>
            </Link>

            <button
              onClick={onOpenOrderModal}
              className="relative group overflow-hidden rounded-lg p-[1px] font-semibold text-xs transition"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 rounded-lg group-hover:opacity-90 transition" />
              <span className="relative flex items-center gap-1.5 px-4 py-2 rounded-[7px] bg-slate-950 hover:bg-transparent text-white transition duration-300">
                <Zap className="w-3.5 h-3.5 text-orange-400 group-hover:text-white" />
                <span>{t({ bn: "নতুন সংযোগ নিন", en: "Get Connection" })}</span>
              </span>
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={onOpenOrderModal}
              className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg"
            >
              {t({ bn: "সংযোগ নিন", en: "Order" })}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3">
            <nav className="flex flex-col space-y-2 text-sm">
              <a href="#hero" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg">
                {t({ bn: "হোম", en: "Home" })}
              </a>
              <a href="#packages" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg">
                {t({ bn: "প্যাকেজসমূহ", en: "Packages" })}
              </a>
              <a href="#pay-bill" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg">
                {t({ bn: "বিল পরিশোধ", en: "Pay Bill" })}
              </a>
              <a href="#coverage" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg">
                {t({ bn: "কভারেজ এরিয়া", en: "Coverage" })}
              </a>
              <a href="#vas" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg">
                {t({ bn: "এফটিপি ও মিডিয়া", en: "FTP & Media" })}
              </a>
              <a href="#why-us" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg">
                {t({ bn: "কেন আমরা", en: "Why Us" })}
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-slate-300 hover:bg-slate-900 rounded-lg">
                {t({ bn: "যোগাযোগ", en: "Contact" })}
              </a>
            </nav>

            <Link
              href={selfCareHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold"
            >
              <User className="w-4 h-4" />
              <span>{t({ bn: isLoggedIn ? "পোর্টালে যান" : "সেলফ-কেয়ার লগইন", en: isLoggedIn ? "Dashboard" : "Self-Care Login" })}</span>
            </Link>
          </div>
        )}
      </header>
    </>
  );
}

