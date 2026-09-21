"use client";

import React from "react";
import { useLanguage } from "./language-context";
import { ShieldCheck, Zap, Headphones, Wifi, Cpu, Sparkles, TrendingUp } from "lucide-react";

const defaultFeaturesList = [
  {
    icon: Wifi,
    title: { bn: "১০০% অপটিক্যাল ফাইবার নেটওয়ার্ক", en: "100% True Optical Fiber" },
    description: {
      bn: "সরাসরি আপনার রাউটার পর্যন্ত অপটিক্যাল ফাইবার কানেকশন, যা ঝড়-বৃষ্টি কিংবা বৈরী আবহাওয়াতেও দেয় সর্বোচ্চ স্থিতিশীলতা।",
      en: "End-to-end fiber direct to your home router, guaranteeing stable throughput in any weather condition.",
    },
    color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
  },
  {
    icon: TrendingUp,
    title: { bn: "৯৯.৯% আপটাইম গ্যারান্টি", en: "99.9% Guaranteed Uptime" },
    description: {
      bn: "রিডানডেন্ট রিং আর্কিটেকচার এবং অটো-ফেইলওভার ব্যাকবোন। এক লাইন ড্রপ করলেও বিকল্প লাইন দিয়ে ইন্টারনেট সচল থাকে।",
      en: "Dual-ring architecture with automated failover ensures your internet never drops even during maintenance.",
    },
    color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  },
  {
    icon: Headphones,
    title: { bn: "২৪/৭ সার্বক্ষণিক টেকনিক্যাল সাপোর্ট", en: "24/7 Dedicated Support" },
    description: {
      bn: "অভিজ্ঞ নেটওয়ার্ক ইঞ্জিনিয়ারদের হটলাইন ১৬২৩ ৪ এবং দ্রুত অন-ফিল্ড টিম। যেকোনো সমস্যা সমাধানে আমরা সদা প্রস্তুত।",
      en: "Expert engineers available on 16234 hotline and rapid field deployment for zero downtime worry.",
    },
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    icon: Zap,
    title: { bn: "BDIX ও গেম পেয়ারিং অপটিমাইজড", en: "BDIX & Low-Latency Gaming" },
    description: {
      bn: "Discord, Steam, Valorant, PUBG ও লোকাল সার্ভারের সাথে লো-পিং ডিরেক্ট সংযোগ। জিরো ল্যাগ ও বাফারলেস ব্রাউজিং।",
      en: "Ultra-low jitter peering for esports titles and zero buffer local streaming over high-speed BDIX.",
    },
    color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
  },
  {
    icon: Cpu,
    title: { bn: "আধুনিক ক্যাশিং ও কনটেন্ট ডেলিভারি", en: "Next-Gen Media Caching" },
    description: {
      bn: "YouTube, Facebook, Netflix ও Akamai-এর সাথে লোকাল সিডিএন সংযোগ থাকায় যেকোনো ভিডিও মুহূর্তেই প্লে হয়।",
      en: "Local CDN peering with major streaming networks ensures instant playback without any loading delay.",
    },
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    icon: ShieldCheck,
    title: { bn: "স্বচ্ছ বিলিং ও কোনো হিডেন চার্জ নেই", en: "Transparent No-Hidden Fees" },
    description: {
      bn: "সরকার ও BTRC অনুমোদিত পরিষ্কার মূল্য তালিকা। সহজ অনলাইন রিচার্জ এবং কোনো বাড়তি অপ্রকাশ্য চার্জ নেই।",
      en: "Strictly regulated transparent pricing with automated invoice receipts and zero surprise hidden charges.",
    },
    color: "text-rose-400 bg-rose-500/10 border-rose-500/30",
  },
];

interface FeaturesProps {
  customWhyUsJson?: string;
}

export function Features({ customWhyUsJson }: FeaturesProps) {
  const { t } = useLanguage();

  let list = defaultFeaturesList;
  if (customWhyUsJson) {
    try {
      const parsed = JSON.parse(customWhyUsJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed.map((item: any, idx: number) => ({
          icon: idx % 2 === 0 ? Wifi : ShieldCheck,
          title: item.title || "Feature",
          description: item.desc || item.description || "High performance feature",
          color: "text-orange-400 bg-orange-500/10 border-orange-500/30",
        }));
      }
    } catch (_) {}
  }

  return (
    <section id="why-us" className="py-20 bg-slate-900/60 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>{t({ bn: "আমাদের প্রযুক্তি ও প্রতিশ্রুতি", en: "Our Technology & Promise" })}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t({
              bn: "কেন NETCAFE ব্রডব্যান্ড নির্বাচন করবেন?",
              en: "Why Choose NETCAFE Broadband?",
            })}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {t({
              bn: "আমরা শুধু ইন্টারনেট সেবা দিই না, আমরা নিশ্চিত করি আপনার কাজ, পড়াশোনা ও বিনোদনের সেরা ডিজিটাল অভিজ্ঞতা।",
              en: "We don't just provide bandwidth; we ensure the smoothest digital experience for work, study, and play.",
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map((item, idx) => {
            const IconComponent = item.icon || Wifi;
            return (
              <div
                key={idx}
                className="p-7 rounded-3xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition duration-300 space-y-4"
              >
                <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.color}`}>
                  <IconComponent className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-white">{t(item.title)}</h3>

                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">{t(item.description)}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

