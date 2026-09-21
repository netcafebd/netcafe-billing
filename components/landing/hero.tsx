"use client";

import React from "react";
import { useLanguage } from "./language-context";
import { Zap, MapPin, CreditCard, Activity, CheckCircle2, ArrowRight, Flame } from "lucide-react";

interface HeroProps {
  onOpenOrder: () => void;
  heroNotice?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  ispName?: string;
}

export function Hero({ onOpenOrder, heroNotice, heroTitle, heroSubtitle, ispName }: HeroProps) {
  const { t } = useLanguage();

  return (
    <section id="hero" className="relative overflow-hidden pt-8 pb-20 md:py-24 bg-hero-pattern">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-ping" />
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>
                {heroNotice ||
                  t({
                    bn: "নতুন গ্রাহকদের জন্য ফ্রি ফাইবার ইনস্টলেশন অফার!",
                    en: "Free Optical Fiber Installation for New Connections!",
                  })}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
              {heroTitle || t({ bn: "দ্রুততম গতিতে সংযোগ,", en: "Ultra-Fast Connectivity," })}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-indigo-400">
                {t({ bn: "নিরবচ্ছিন্ন ডিজিটাল জীবন", en: "Uninterrupted Digital Life" })}
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {heroSubtitle ||
                t({
                  bn: "NETCAFE ফাইবার ব্রডব্যান্ড নিয়ে এলো বাফারলেস ৪K ভিডিও স্ট্রিমিং, ১০০+ এমবিপিএস BDIX স্পিড, সুপার লো-পিং গেমিং এবং সার্বক্ষণিক ২৪/৭ টেকনিক্যাল সাপোর্ট।",
                  en: "NETCAFE Fiber Broadband brings you bufferless 4K streaming, 100+ Mbps BDIX bandwidth, ultra-low ping gaming, and round-the-clock technical support.",
                })}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t({ bn: "১০০% অপটিক্যাল ফাইবার", en: "100% Optical Fiber" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t({ bn: "১০০+ Mbps BDIX স্পিড", en: "100+ Mbps BDIX Speed" })}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t({ bn: "লোকাল FTP ও লাইভ টিভি", en: "Local FTP & Live TV" })}</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                type="button"
                onClick={onOpenOrder}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition transform hover:-translate-y-0.5 flex items-center gap-2 group"
              >
                <span>{t({ bn: "নতুন সংযোগ বুক করুন", en: "Book New Connection" })}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </button>

              <a
                href="#coverage"
                className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-slate-700 transition flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-indigo-400" />
                <span>{t({ bn: "কভারেজ চেক করুন", en: "Check Coverage" })}</span>
              </a>

              <a
                href="#pay-bill"
                className="px-5 py-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/80 text-slate-300 hover:text-orange-400 font-semibold text-sm transition flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>{t({ bn: "দ্রুত বিল পে", en: "Quick Bill Pay" })}</span>
              </a>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-2xl shadow-indigo-950/60 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-sm sm:text-base">{ispName || "NETCAFE Gigabit Fiber"}</h3>
                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {t({ bn: "নেটওয়ার্ক স্ট্যাটাস: অপ্টিমাল", en: "Network Status: Optimal" })}
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  IPv6 Ready
                </span>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t({ bn: "ইন্টারন্যাশনাল স্পিড", en: "International Bandwidth" })}</span>
                    <span className="text-indigo-400 font-bold">100 - 200 Mbps</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full w-[85%] animate-pulse" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t({ bn: "BDIX লোকাল ব্যান্ডউইথ", en: "BDIX Peering Bandwidth" })}</span>
                    <span className="text-orange-400 font-bold">100+ Mbps (Ultra)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full w-[95%]" />
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{t({ bn: "লেটেন্সি (Ping)", en: "Latency (Ping)" })}</span>
                    <span className="text-emerald-400 font-bold">1ms BDIX Ping</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full w-[98%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
