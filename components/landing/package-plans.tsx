"use client";

import React, { useState } from "react";
import { useLanguage } from "./language-context";
import { Check, Zap, ArrowRight, Flame, Sparkles, Server, PhoneCall } from "lucide-react";

const defaultPackages: Record<string, any[]> = {
  home: [
    {
      id: "home-30",
      name: { bn: "স্টার্টিং ফাইবার", en: "Fiber Starter" },
      speed: "35 Mbps",
      regularPrice: 850,
      price: 800,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: false,
      badge: { bn: "বাজেট প্ল্যান", en: "Budget Pick" },
      features: [
        { bn: "৩৫ এমবিপিএস আনলিমিটেড ইন্টারনেট", en: "35 Mbps Unlimited Internet" },
        { bn: "১০০ এমবিপিএস BDIX ও লোকাল ব্যান্ডউইথ", en: "100 Mbps BDIX & Local Bandwidth" },
        { bn: "৪কে বাফারলেস ইউটিউব ও ফেসবুক ক্যাশ", en: "4K Bufferless YouTube & FB Caching" },
        { bn: "সার্কেলএফটিপি (FTP) ও লাইভ টিভি এক্সেস", en: "Local FTP & Live TV Access" },
        { bn: "১০০% অপটিক্যাল ফাইবার ডিরেক্ট কানেকশন", en: "100% Optical Fiber Direct Connection" },
        { bn: "২৪/৭ কাস্টমার সাপোর্ট সার্ভিস", en: "24/7 Dedicated Helpline Support" },
      ],
      idealFor: { bn: "সাধারণ ব্রাউজিং এবং ছোট পরিবারের জন্য", en: "Ideal for small families & casual streaming" },
    },
    {
      id: "home-50",
      name: { bn: "সুপার ফ্যামিলি", en: "Super Family" },
      speed: "60 Mbps",
      regularPrice: 1150,
      price: 1000,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: true,
      badge: { bn: "সেরা পছন্দ (Most Popular)", en: "Most Popular" },
      features: [
        { bn: "৬০ এমবিপিএস আল্ট্রা-ফাস্ট ব্যান্ডউইথ", en: "60 Mbps Ultra-Fast Bandwidth" },
        { bn: "১০০+ এমবিপিএস BDIX সুপার স্পিড", en: "100+ Mbps BDIX Super Speed" },
        { bn: "ফ্রি ইনস্টলেশন সুবিধা*", en: "Free Fiber Installation Facility*" },
        { bn: "৫০+ এইচডি লাইভ টিভি চ্যানেল ও ওটিটি", en: "50+ HD Live TV Channels & OTT" },
        { bn: "লোকাল হাই-স্পিড FTP মুভি ও গেম সার্ভার", en: "Ultra-Fast Local FTP Server Access" },
        { bn: "IPv6 ও লো-লেটেন্সি গেমিং অপটিমাইজেশন", en: "IPv6 Ready & Low Ping Gaming" },
      ],
      idealFor: { bn: "একসাথে ৪-৬টি ডিভাইসে স্মুথ স্ট্রিমিং ও ওয়ার্ক", en: "Perfect for 4-6 devices, HD streaming & work" },
    },
    {
      id: "home-80",
      name: { bn: "টার্বো স্পিড", en: "Turbo Speed" },
      speed: "85 Mbps",
      regularPrice: 1400,
      price: 1250,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: false,
      badge: { bn: "হাই ডিমান্ড", en: "High Demand" },
      features: [
        { bn: "৮৫ এমবিপিএস ডেডিকেটেড এক্সপেরিয়েন্স", en: "85 Mbps High-Speed Bandwidth" },
        { bn: "১০০+ এমবিপিএস BDIX ও পেয়ারিং স্পিড", en: "100+ Mbps BDIX & Peering Speed" },
        { bn: "ফ্রি ইনস্টলেশন ও অপটিক্যাল প্যাচকর্ড", en: "Free Installation & Fiber Patch Cord" },
        { bn: "পাবলিক রিয়েল আইপি (অনুরোধ সাপেক্ষে)", en: "Public Real IP Available upon Request" },
        { bn: "সব ধরনের ওটিটি ও ক্লাউড স্টোরেজ অপটিমাইজড", en: "Optimized for OTT, 4K & Cloud Backup" },
        { bn: "প্রায়োরিটি টেকনিক্যাল সাপোর্ট", en: "Priority 24/7 Field Support" },
      ],
      idealFor: { bn: "ভারী ডাউনলোড, ফ্রিল্যান্সার ও মাল্টি-ইউজার", en: "Freelancers, 4K power users & heavy downloads" },
    },
    {
      id: "home-120",
      name: { bn: "আল্টিমেট প্রো", en: "Ultimate Pro" },
      speed: "125 Mbps",
      regularPrice: 1800,
      price: 1500,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: false,
      badge: { bn: "প্রিমিয়াম", en: "Premium Tier" },
      features: [
        { bn: "১২৫ এমবিপিএস এক্সট্রিম ফাইবার স্পিড", en: "125 Mbps Extreme Fiber Speed" },
        { bn: "২০০ এমবিপিএস আল্ট্রা BDIX কানেক্টিভিটি", en: "200 Mbps Ultra BDIX Connectivity" },
        { bn: "রিয়েল আইপি সম্পূর্ণ ফ্রি", en: "Complimentary Dedicated Real IP" },
        { bn: "ফ্রি রাউটার অপটিমাইজেশন ও ইনস্টলেশন", en: "Free Router Tuning & Setup" },
        { bn: "আনলিমিটেড লোকাল কনটেন্ট ও ক্লাউড ডাটা", en: "Unlimited Local Content & Cloud Sync" },
        { bn: "ভিআইপি হেল্পলাইন সাপোর্ট ও দ্রুত সমাধান", en: "VIP Priority Support Desk" },
      ],
      idealFor: { bn: "কনটেন্ট ক্রিয়েটর, হাই-এন্ড স্ট্রিমার ও বড় বাড়ি", en: "Streamers, Content Creators & Smart Homes" },
    },
  ],
  corporate: [
    {
      id: "corp-basic",
      name: { bn: "এসএমই বিজনেস কানেক্ট", en: "SME Business Connect" },
      speed: "50 Mbps (1:1)",
      regularPrice: 4500,
      price: 4000,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: false,
      badge: { bn: "ছোট অফিসের জন্য", en: "For Small Office" },
      features: [
        { bn: "৫০ এমবিপিএস সিমেট্রিক (১:১) ডেডিকেটেড স্পিড", en: "50 Mbps Symmetric (1:1) Dedicated Bandwidth" },
        { bn: "১টি স্ট্যাটিক পাবলিক রিয়েল আইপি", en: "1 Static Public Real IP Included" },
        { bn: "৯৯.৯% আপটাইম SLA নিশ্চয়তা", en: "99.9% Uptime Service Level Agreement" },
        { bn: "ডুয়াল ফাইবার লিংক ব্যাকবোন", en: "Dual Optical Fiber Link Backbone" },
        { bn: "২৪/৭ ডেডিকেটেড কর্পোরেট অ্যাকাউন্ট ম্যানেজার", en: "Dedicated 24/7 Corporate Account Manager" },
      ],
      idealFor: { bn: "১০-২০ জন কর্মীর অফিস ও কর্পোরেট ব্রাঞ্চ", en: "Offices with 10-20 workstations" },
    },
    {
      id: "corp-pro",
      name: { bn: "এন্টারপ্রাইজ গিগাবিট", en: "Enterprise Gigabit" },
      speed: "100 Mbps (1:1)",
      regularPrice: 8500,
      price: 7500,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: true,
      badge: { bn: "কর্পোরেট বেস্টসেলার", en: "Enterprise Best" },
      features: [
        { bn: "১০০ এমবিপিএস সিমেট্রিক ডেডিকেটেড আনলিমিটেড", en: "100 Mbps Dedicated 1:1 Clean Pipe" },
        { bn: "২টি স্ট্যাটিক রিয়েল আইপি পুল", en: "2 Usable Public Static Real IPs" },
        { bn: "৯৯.৯৯% নেটওয়ার্ক এভেইল্যাবিলিটি SLA", en: "99.99% High Availability SLA" },
        { bn: "অটোমেটিক ফেইলওভার রিডানড্যান্সি", en: "Automated Failover Redundancy" },
        { bn: "রিয়েল-টাইম MRTG ব্যান্ডউইথ ট্র্যাকিং পোর্টাল", en: "Live MRTG Bandwidth Monitoring Access" },
        { bn: "২ ঘন্টার মধ্যে অন-সাইট সাপোর্ট নিশ্চয়তা", en: "2-Hour Guaranteed On-site Resolution" },
      ],
      idealFor: { bn: "আইটি ফার্ম, সফটওয়্যার কোম্পানি ও কল সেন্টার", en: "IT firms, Software Companies & Call Centers" },
    },
  ],
  gamer: [
    {
      id: "game-core",
      name: { bn: "গেমার ব্যাটলগ্রাউন্ড", en: "Gamer Battleground" },
      speed: "75 Mbps",
      regularPrice: 1500,
      price: 1300,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: true,
      badge: { bn: "লো-পিং স্পেশাল", en: "Low-Ping Special" },
      features: [
        { bn: "৭৫ এমবিপিএস সুপার হাই স্পিড ব্যান্ডউইথ", en: "75 Mbps Ultra-low Jitter Bandwidth" },
        { bn: "সিঙ্গাপুর ও ভারত গেমিং সার্ভারে সুপার লো পিং", en: "Singapore & India Server Ultra Low Latency" },
        { bn: "ফ্রি ডায়নামিক/পাবলিক রিয়েল আইপি", en: "Complimentary Real IP for Port Forwarding" },
        { bn: "Discord, Steam, Valorant, PUBG অপটিমাইজড রাউটিং", en: "Optimized Routing for Steam, Riot, Discord" },
        { bn: "২০০ এমবিপিএস পর্যন্ত লোকাল ক্যাশ ও BDIX", en: "Up to 200 Mbps BDIX & Local Media Cache" },
        { bn: "জিরো প্যাকেট ড্রপ নিশ্চয়তা", en: "Zero Packet Loss Architecture" },
      ],
      idealFor: { bn: "প্রতিযোগিতামূলক ইস্পোর্টস ও অনলাইন গেমারদের জন্য", en: "Competitive Esports & Online Gamers" },
    },
    {
      id: "stream-elite",
      name: { bn: "প্রো স্ট্রিমার ও ইউটিউবার", en: "Pro Streamer Elite" },
      speed: "150 Mbps",
      regularPrice: 2400,
      price: 2100,
      period: { bn: "প্রতি মাস", en: "per month" },
      popular: false,
      badge: { bn: "হাই আপলোড স্পিড", en: "High Upload Speed" },
      features: [
        { bn: "১৫০ এমবিপিএস হাই আপলোড ও ডাউনলোড ক্যাপাসিটি", en: "150 Mbps High Upload & Download Capacity" },
        { bn: "বাফারলেস 4K 60FPS লাইভ স্ট্রিমিং সুবিধা", en: "Bufferless 4K 60FPS Live Streaming Ready" },
        { bn: "স্ট্যাটিক রিয়েল আইপি অন্তর্ভুক্ত", en: "Static Public Real IP Included" },
        { bn: "টুইচ, ইউটিউব ও ফেসবুক লাইভে প্রায়োরিটি রুট", en: "Priority Traffic Queuing for Twitch & YT" },
        { bn: "২৪/৭ ভিআইপি এস্পোর্টস সাপোর্ট ডেস্ক", en: "24/7 VIP Esports Priority Desk" },
      ],
      idealFor: { bn: "ইউটিউব ও ফেসবুক গেম স্ট্রিমার ও ভিডিও এডিটর", en: "Pro Streamers, YouTubers & Media Studios" },
    },
  ],
};

interface PackagePlansProps {
  onSelectPackage: (pkg: any) => void;
  customPackagesJson?: string;
  hotline?: string;
}

export function PackagePlans({ onSelectPackage, customPackagesJson, hotline }: PackagePlansProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("home");

  let packageData = defaultPackages;
  if (customPackagesJson) {
    try {
      const parsed = JSON.parse(customPackagesJson);
      if (typeof parsed === "object" && parsed !== null) {
        if (Array.isArray(parsed)) {
          packageData = { ...defaultPackages, home: parsed };
        } else {
          packageData = { ...defaultPackages, ...parsed };
        }
      }
    } catch (_) {}
  }

  const currentPackages = packageData[activeTab] || packageData["home"] || [];

  return (
    <section id="packages" className="py-20 bg-slate-900/60 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>{t({ bn: "সাশ্রয়ী মূল্যে সেরা ব্যান্ডউইথ", en: "Best Bandwidth at Affordable Prices" })}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t({
              bn: "আপনার প্রয়োজন অনুযায়ী সেরা ইন্টারনেট প্যাকেজ",
              en: "Tailored High-Speed Internet Packages",
            })}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {t({
              bn: "হোম, কর্পোরেট বা গেমিং—প্রতিটি প্যাকেজে পাবেন বাফারলেস ৪K স্ট্রিমিং, ১০০+ এমবিপিএস BDIX স্পিড এবং নিরবচ্ছিন্ন ২৪/৭ সাপোর্ট।",
              en: "From home to enterprise and pro gaming, enjoy buffer-free 4K, 100+ Mbps BDIX speed, and rock-solid 24/7 support.",
            })}
          </p>

          {/* Category Tabs */}
          <div className="pt-4 flex justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-xl">
              <button
                onClick={() => setActiveTab("home")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === "home"
                    ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>{t({ bn: "হোম ইন্টারনেট", en: "Home Internet" })}</span>
              </button>

              <button
                onClick={() => setActiveTab("corporate")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === "corporate"
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Server className="w-4 h-4" />
                <span>{t({ bn: "কর্পোরেট ১:১", en: "Corporate 1:1" })}</span>
              </button>

              <button
                onClick={() => setActiveTab("gamer")}
                className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                  activeTab === "gamer"
                    ? "bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-md shadow-rose-500/25"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>{t({ bn: "গেমার ও স্ট্রিমার", en: "Gamer & Streamer" })}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {currentPackages.map((pkg, idx) => {
            const isPopular = pkg.popular;

            return (
              <div
                key={pkg.id || idx}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                  isPopular
                    ? "bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-orange-500 shadow-xl shadow-orange-500/10 scale-[1.02]"
                    : "bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900/60"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black tracking-wide shadow-md flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    <span>{t(pkg.badge)}</span>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                        {t(pkg.badge)}
                      </span>
                      {pkg.regularPrice && (
                        <span className="text-xs text-slate-500 line-through">৳{pkg.regularPrice}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white mt-1">{t(pkg.name)}</h3>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/20 text-center mb-6">
                    <span className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200">
                      {pkg.speed}
                    </span>
                    <p className="text-[11px] text-indigo-300 font-medium mt-0.5">
                      {t({ bn: "অপটিক্যাল ফাইবার রিয়েল স্পিড", en: "Optical Fiber Real Speed" })}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl sm:text-4xl font-black text-white">৳{pkg.price}</span>
                      <span className="text-xs text-slate-400 font-medium">/{t(pkg.period || { bn: "প্রতি মাস", en: "per month" })}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {t({ bn: "(+ভ্যাট প্রযোজ্য)", en: "(+VAT Applicable)" })}
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-6 text-xs sm:text-sm text-slate-300 border-t border-slate-800 pt-5">
                    {Array.isArray(pkg.features) &&
                      pkg.features.map((feat: any, fIdx: number) => (
                        <div key={fIdx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3" />
                          </div>
                          <span>{t(feat)}</span>
                        </div>
                      ))}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => onSelectPackage(pkg)}
                    className={`w-full py-3.5 rounded-2xl font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 group ${
                      isPopular
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25"
                        : "bg-slate-900 hover:bg-slate-800 text-white border border-slate-700"
                    }`}
                  >
                    <span>{t({ bn: "সংযোগটি অর্ডার করুন", en: "Order Connection" })}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </button>

                  {pkg.idealFor && (
                    <p className="text-[11px] text-slate-400 text-center mt-2.5 font-medium">
                      {t(pkg.idealFor)}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise Customized Bandwidth Banner */}
        <div className="mt-14 rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-950 via-indigo-950/60 to-slate-950 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-1.5 text-center md:text-left">
            <h4 className="text-lg sm:text-xl font-bold text-white">
              {t({ bn: "আপনার কি কাস্টমাইজড বা বড় ব্যান্ডউইথ প্রয়োজন?", en: "Need customized bandwidth or enterprise connectivity?" })}
            </h4>
            <p className="text-xs sm:text-sm text-slate-300">
              {t({
                bn: "আমাদের এন্টারপ্রাইজ টিম আপনার প্রতিষ্ঠানের উপযোগী স্পেশাল ব্যান্ডউইথ কোটেশন ও অন-সাইট সার্ভে অফার করে।",
                en: "Our enterprise team offers custom bandwidth quotations, optical fiber redundancy, and on-site surveys for your business.",
              })}
            </p>
          </div>

          <a
            href={`tel:${hotline || "16234"}`}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 transition flex items-center gap-2 shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t({ bn: `কর্পোরেট হটলাইন: ${hotline || "১৬২৩৪"}`, en: `Corporate Hotline: ${hotline || "16234"}` })}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
