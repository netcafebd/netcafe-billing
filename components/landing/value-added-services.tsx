"use client";

import React from "react";
import { useLanguage } from "./language-context";
import { Server, Tv, Film, ShieldCheck, ExternalLink, Sparkles, Gauge, Play } from "lucide-react";

const defaultVasServices = [
  {
    id: "ftp",
    title: { bn: "NETCAFE হাই-স্পিড FTP সার্ভার", en: "NETCAFE High-Speed FTP Server" },
    tag: { bn: "১০০+ এমবিপিএস স্পিড", en: "100+ Mbps Speed" },
    description: {
      bn: "মুভি, ওয়েব সিরিজ, পিসি গেমস, সফটওয়্যার ও অ্যানিমেটেড ফিল্মের সুবিশাল সংগ্রহশালা। কোনো ডেটা লিমিট বা বাফারিং ছাড়া চোখের পলকে ডাউনলোড ও স্ট্রিমিং করুন।",
      en: "Massive local repository of latest 4K movies, TV series, PC games & software. Instant bufferless downloads directly from high-speed local storage.",
    },
    icon: Server,
    stats: { bn: "৫০,০০০+ কনটেন্ট", en: "50,000+ Contents" },
    linkText: { bn: "FTP সার্ভার ব্রাউজ করুন", en: "Browse FTP Server" },
    portalUrl: "http://ftp.netcafebd.com",
  },
  {
    id: "livetv",
    title: { bn: "BDIX লাইভ টিভি (HD পোর্টাল)", en: "BDIX Live TV Portal" },
    tag: { bn: "৬০+ এইচডি চ্যানেল", en: "60+ HD Channels" },
    description: {
      bn: "দেশি-বিদেশি সকল জনপ্রিয় সংবাদ, খেলাধুলা, নাটক ও কার্টুন চ্যানেল দেখুন সম্পূর্ণ ক্রিস্টাল ক্লিয়ার এইচডি কোয়ালিটিতে, জিরো বাফারিংয়ে।",
      en: "Watch all popular local and international news, sports, entertainment and kids channels in crisp 1080p full HD with zero buffering.",
    },
    icon: Tv,
    stats: { bn: "১০০% ফ্রি BDIX", en: "100% Free BDIX" },
    linkText: { bn: "লাইভ টিভি দেখুন", en: "Watch Live TV" },
    portalUrl: "http://tv.netcafebd.com",
  },
  {
    id: "ott",
    title: { bn: "OTT প্ল্যাটফর্ম কম্বো প্যাক", en: "OTT Entertainment Combo" },
    tag: { bn: "প্রিমিয়াম সাবস্ক্রিপশন", en: "Premium Bundles" },
    description: {
      bn: "Chorki, Hoichoi, Toffee এবং Binge-এর মতো শীর্ষস্থানীয় ওটিটি সাবস্ক্রিপশন পান আমাদের সিলেক্টেড ফাইবার হোম প্যাকেজের সাথে একদম ফ্রি বা বিশেষ ছাড়ে।",
      en: "Access premium entertainment with bundled subscriptions to Chorki, Hoichoi, Toffee, and Binge included with select high-speed plans.",
    },
    icon: Film,
    stats: { bn: "৪টি ওটিটি প্ল্যাটফর্ম", en: "4 Top OTTs" },
    linkText: { bn: "ওটিটি অফার দেখুন", en: "View OTT Offers" },
    portalUrl: "#packages",
  },
  {
    id: "cctv",
    title: { bn: "ক্লাউড আইপি ও সিকিউরিটি সলিউশন", en: "Cloud IP & Surveillance" },
    tag: { bn: "স্মার্ট নজরদারি", en: "Smart Surveillance" },
    description: {
      bn: "বাসা ও অফিসের সার্বক্ষণিক সুরক্ষায় রিয়েল আইপি সহ হাই-ডেফিনিশন আইপি ক্যামেরা ও ক্লাউড সিকিউরিটি সেটআপের পূর্ণাঙ্গ সমাধান।",
      en: "Complete end-to-end cloud IP camera setup, real IP routing, and smart remote surveillance solutions for homes and corporate spaces.",
    },
    icon: ShieldCheck,
    stats: { bn: "২৪/৭ ক্লাউড ব্যাকআপ", en: "24/7 Cloud Sync" },
    linkText: { bn: "পরামর্শ নিন", en: "Get Consultation" },
    portalUrl: "#contact",
  },
];

interface ValueAddedServicesProps {
  customFtpJson?: string;
}

export function ValueAddedServices({ customFtpJson }: ValueAddedServicesProps) {
  const { t } = useLanguage();

  let services = defaultVasServices;
  if (customFtpJson) {
    try {
      const parsed = JSON.parse(customFtpJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        services = parsed.map((item: any, idx: number) => ({
          id: `custom-${idx}`,
          title: item.name || item.title || "FTP Server",
          tag: { bn: "BDIX High Speed", en: "BDIX High Speed" },
          description: item.desc || item.description || "High-speed media streaming",
          icon: Server,
          stats: { bn: "১০০% BDIX", en: "100% BDIX" },
          linkText: { bn: "ব্রাউজ করুন", en: "Browse" },
          portalUrl: item.url || "http://ftp.netcafebd.com",
        }));
      }
    } catch (_) {}
  }

  return (
    <section id="vas" className="py-20 bg-slate-950 relative overflow-hidden">
      <div className="absolute top-1/3 left-10 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/30 text-xs font-semibold text-orange-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t({ bn: "ভ্যালু অ্যাডেড সার্ভিসেস (VAS)", en: "Value Added Services (VAS)" })}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t({
              bn: "ডিজিটাল বিনোদন ও মিডিয়া সার্ভার হাব",
              en: "Digital Entertainment & Media Hub",
            })}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {t({
              bn: "NETCAFE-এর গ্রাহক হিসেবে উপভোগ করুন লোকাল ক্যাশিংয়ের অবিশ্বাস্য গতি। কোনো আন্তর্জাতিক ব্যান্ডউইথ খরচ ছাড়া লোকাল স্পিডে মুভি, লাইভ টিভি ও ওটিটি কনটেন্ট।",
              en: "Enjoy the incredible power of local BDIX caching. Access movies, live TV, and games at 100+ Mbps local peering speeds.",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, idx) => {
            const IconComponent = service.icon || Server;
            return (
              <div
                key={service.id || idx}
                className="rounded-3xl p-6 bg-slate-900/80 border border-slate-800/90 hover:border-indigo-500/50 hover:bg-slate-900 transition-all duration-300 flex flex-col justify-between group shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:text-orange-400 group-hover:border-orange-500/40 group-hover:bg-orange-500/15 transition flex items-center justify-center">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {t(service.tag)}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition">
                    {t(service.title)}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                    {t(service.description)}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-850 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400">
                    {t(service.stats)}
                  </span>

                  <a
                    href={service.portalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition"
                  >
                    <span>{t(service.linkText)}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-indigo-500/30 flex flex-col lg:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center text-indigo-400 shrink-0">
              <Gauge className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg sm:text-xl font-bold text-white">
                {t({ bn: "আপনার বর্তমান ইন্টারনেট স্পিড পরীক্ষা করতে চান?", en: "Want to test your current internet speed?" })}
              </h4>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                {t({
                  bn: "NETCAFE-এর ডেডিকেটেড স্পিডটেস্ট সার্ভার দিয়ে পিং, জিটার, ডাউনলোড ও আপলোড স্পিড টেস্ট করুন।",
                  en: "Test your live latency, jitter, upload, and download speed using our direct Ookla peering server.",
                })}
              </p>
            </div>
          </div>

          <a
            href="https://www.speedtest.net"
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 shrink-0"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{t({ bn: "স্পিডটেস্ট শুরু করুন", en: "Run Speed Test" })}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
