import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/db/prisma";
import { getSession } from "@/lib/auth/session";
import { BillSearchWidget } from "@/components/landing/bill-search-widget";
import {
  Wifi,
  PhoneCall,
  Globe,
  User,
  Zap,
  Flame,
  CircleCheck,
  ArrowRight,
  MapPin,
  CreditCard,
  ShieldCheck,
  Tv,
  HardDrive,
  Server,
  Headphones,
  Check,
} from "lucide-react";

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
        bkashNumber: "01622280960",
        paymentInstructions: "1. Open bKash App\n2. Select 'Send Money'\n3. Enter ISP bKash Number\n4. Enter exact bill amount",
      },
    });
  }

  // Parse package configuration
  let packages = [
    { name: "Regular Fiber", speed: "15 Mbps", price: 500, bdix: "100 Mbps", features: ["15 Mbps Shared Fiber", "100 Mbps BDIX Speed", "Bufferless 4K Youtube", "24/7 Customer Support"] },
    { name: "Gaming Turbo", speed: "25 Mbps", price: 800, bdix: "100 Mbps", features: ["25 Mbps Ultra Fiber", "Super Low-Ping Gaming", "Local BDIX FTP Access", "Dedicated IP Support"] },
    { name: "Super Speed", speed: "40 Mbps", price: 1200, bdix: "100 Mbps", features: ["40 Mbps High-Speed Fiber", "Full BDIX & Live TV", "Multiple Device Support", "Priority 24/7 Helpline"] },
    { name: "Corporate Pro", speed: "60 Mbps", price: 1800, bdix: "100 Mbps", features: ["60 Mbps Dedicated Line", "Uncompressed 4K Stream", "Full FTP & Movie Server", "Instant On-Site Support"] },
  ];

  if (settings.packagesJson) {
    try {
      const parsed = JSON.parse(settings.packagesJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        packages = parsed;
      }
    } catch (_) {}
  }

  const selfCareHref = session
    ? session.role === "ADMIN"
      ? "/admin/dashboard"
      : "/portal/dashboard"
    : "/login";

  return (
    <div className="flex flex-col min-h-screen bg-[#080d1a] text-slate-100 font-sans overflow-x-hidden">
      {/* Top Announcement Bar */}
      <div className="bg-slate-950 border-b border-slate-800/80 text-xs text-slate-300 py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center space-x-4">
            <span className="flex items-center gap-1.5 text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              ২৪/৭ নিরবচ্ছিন্ন ব্রডব্যান্ড সেবা
            </span>
            <span className="hidden md:inline text-slate-700">|</span>
            <span className="hidden md:flex items-center gap-1 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              BTRC অনুমোদিত অপটিক্যাল ফাইবার নেটওয়ার্ক
            </span>
          </div>
          <div className="flex items-center gap-4 ml-auto">
            <a
              href={`tel:${settings.hotline || "16234"}`}
              className="flex items-center gap-1.5 text-orange-400 hover:text-orange-300 font-semibold transition"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>হটলাইন: {settings.hotline || "16234"}</span>
            </a>
            <span className="text-slate-700">|</span>
            <Link
              href={selfCareHref}
              className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition border border-slate-700"
            >
              <User className="w-3.5 h-3.5 text-orange-400" />
              <span>{session ? "পোর্টালে যান" : "সেলফ-কেয়ার লগইন"}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="sticky top-0 z-50 bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/60 py-4">
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

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <a href="#hero" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              হোম
            </a>
            <a href="#packages" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              প্যাকেজসমূহ
            </a>
            <a href="#pay-bill" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              বিল অনুসন্ধান ও পে
            </a>
            <a href="#coverage" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              কভারেজ এরিয়া
            </a>
            <a href="#vas" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              এফটিপি ও মিডিয়া
            </a>
            <a href="#contact" className="px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition">
              যোগাযোগ
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href={selfCareHref}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-100 bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 shadow-xs transition"
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              <span>{session ? "এডমিন / কাস্টমার পোর্টাল" : "সেলফ-কেয়ার লগইন"}</span>
            </Link>

            <a
              href="#packages"
              className="hidden sm:flex relative group overflow-hidden rounded-xl p-[1px] font-semibold text-xs transition"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 rounded-xl group-hover:opacity-90 transition" />
              <span className="relative flex items-center gap-1.5 px-4 py-2 rounded-[11px] bg-slate-950 hover:bg-transparent text-white transition duration-300">
                <Zap className="w-3.5 h-3.5 text-orange-400 group-hover:text-white" />
                <span>নতুন সংযোগ নিন</span>
              </span>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="hero" className="relative overflow-hidden pt-10 pb-20 md:py-24">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-indigo-500/30 text-xs font-semibold text-indigo-300 shadow-inner">
                  <span className="flex h-2 w-2 rounded-full bg-orange-400 animate-ping" />
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>{settings.heroNotice || "নতুন গ্রাহকদের জন্য ফ্রি ফাইবার ইনস্টলেশন অফার!"}</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.15]">
                  {settings.heroTitle || "দ্রুততম গতিতে সংযোগ,"}{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-300 to-indigo-400">
                    নিরবচ্ছিন্ন ডিজিটাল জীবন
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {settings.heroSubtitle ||
                    "NETCAFE ফাইবার ব্রডব্যান্ড নিয়ে এলো বাফারলেস ৪K ভিডিও স্ট্রিমিং, ১০০+ এমবিপিএস BDIX স্পিড, সুপার লো-পিং গেমিং এবং সার্বক্ষণিক ২৪/৭ টেকনিক্যাল সাপোর্ট।"}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs sm:text-sm text-slate-300">
                  <div className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>১০০% অপটিক্যাল ফাইবার</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>১০০+ Mbps BDIX স্পিড</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CircleCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>লোকাল FTP ও লাইভ টিভি</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4">
                  <a
                    href="#packages"
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-500/25 transition transform hover:-translate-y-0.5 flex items-center gap-2 group"
                  >
                    <span>নতুন সংযোগ বুক করুন</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                  </a>

                  <Link
                    href={selfCareHref}
                    className="px-6 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white font-semibold text-sm sm:text-base border border-slate-700 transition flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>সেলফ-কেয়ার পোর্টাল</span>
                  </Link>
                </div>
              </div>

              {/* Hero Image Card */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-md p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-indigo-500/30 shadow-2xl shadow-indigo-950/60 backdrop-blur-sm">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                        <Wifi className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-sm sm:text-base">{settings.ispName}</h3>
                        <p className="text-xs text-emerald-400 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" /> আল্ট্রা-ফাস্ট কানেকশন
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">BDIX পিক স্পিড</span>
                        <p className="text-xl font-black text-orange-400">100+ Mbps</p>
                      </div>
                      <HardDrive className="w-8 h-8 text-orange-400/80" />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-400">অনলাইন সাপোর্ট</span>
                        <p className="text-lg font-bold text-slate-200">২৪ ঘণ্টা / ৭ দিন</p>
                      </div>
                      <Headphones className="w-8 h-8 text-indigo-400/80" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live Customer Bill Search & Pay Section */}
        <section id="pay-bill" className="py-16 bg-slate-950/60 border-y border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <BillSearchWidget />
          </div>
        </section>

        {/* Packages Grid Section */}
        <section id="packages" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                ইন্টারনেট প্যাকেজসমূহ
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
                আপনার প্রয়োজন অনুযায়ী সেরা ফাইবার প্যাকেজ বেছে নিন
              </h2>
              <p className="text-sm sm:text-base text-slate-400 mt-2">
                সকল প্যাকেজের সাথে থাকছে ১০০ Mbps BDIX স্পিড, লোকাল FTP সার্ভার এবং লাইভ টিভি সুবিধা।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {packages.map((pkg: any, idx: number) => (
                <div
                  key={pkg.name || idx}
                  className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between hover:border-orange-500/50 transition duration-300 shadow-xl shadow-slate-950/50 group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white group-hover:text-orange-400 transition">
                        {pkg.name}
                      </h3>
                      <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20">
                        {pkg.speed}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl sm:text-4xl font-black text-white">৳{pkg.price}</span>
                        <span className="text-xs text-slate-400">/ মাস</span>
                      </div>
                      <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                        <Zap className="w-3.5 h-3.5" /> BDIX: {pkg.bdix || "100 Mbps"}
                      </p>
                    </div>

                    <ul className="space-y-2.5 text-xs text-slate-300 border-t border-slate-800 pt-4 mb-6">
                      {Array.isArray(pkg.features)
                        ? pkg.features.map((feat: string, i: number) => (
                            <li key={i} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>{feat}</span>
                            </li>
                          ))
                        : (
                          <>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>১০০% অপটিক্যাল ফাইবার কানেকশন</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>বাফারলেস ৪K ভিডিও স্ট্রিমিং</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                              <span>২৪/৭ কাস্টমার সাপোর্ট</span>
                            </li>
                          </>
                        )}
                    </ul>
                  </div>

                  <a
                    href={`tel:${settings.hotline || "16234"}`}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-orange-500 text-white font-bold text-xs text-center transition duration-200"
                  >
                    সংযোগ নিতে কল করুন
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Coverage Area Section */}
        <section id="coverage" className="py-16 bg-slate-950/80 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
            <div className="max-w-3xl mx-auto space-y-4">
              <MapPin className="w-10 h-10 text-orange-400 mx-auto" />
              <h2 className="text-3xl font-black text-white">কভারেজ এরিয়া</h2>
              <p className="text-base text-slate-300">
                {settings.coverageArea || "ঢাকা, সাভার, গাজীপুর, চট্টগ্রাম এবং সারা দেশজুড়ে বিস্তৃত ফাইবার নেটওয়ার্ক।"}
              </p>
            </div>
          </div>
        </section>

        {/* Media & FTP Server Section */}
        <section id="vas" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                ভ্যালু অ্যাডেড সার্ভিসেস
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
                এফটিপি সার্ভার ও লাইভ টিভি মিডিয়া
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                <Server className="w-10 h-10 text-orange-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">BDIX FTP সার্ভার</h3>
                <p className="text-xs text-slate-400">
                  সুপার ফাস্ট স্পিডে ১০,০০০+ মুভি, টিভি সিরিজ এবং সফটওয়্যার ডাউনলোড করুন।
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                <Tv className="w-10 h-10 text-indigo-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">লাইভ টিভি মিডিয়া</h3>
                <p className="text-xs text-slate-400">
                  দেশী-বিদেশী ১০০+ এইচডি চ্যানেল সরাসরি আপনার স্মার্ট টিভি বা মোবাইলে দেখুন।
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 text-center space-y-3">
                <Zap className="w-10 h-10 text-amber-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">লো-পিং গেমিং</h3>
                <p className="text-xs text-slate-400">
                  PUBG, Valorant, FreeFire সহ জনপ্রিয় সব গেমে পান জিরো-ল্যাগ লো পিং।
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-slate-950 border-t border-slate-800/80 py-12 px-4 sm:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl font-black text-white">NET</span>
              <span className="text-xl font-black text-orange-400">CAFE</span>
            </div>
            <p className="text-slate-400 text-xs">
              স্বত্বাধিকার © {new Date().getFullYear()} {settings.ispName}। সর্বস্বত্ব সংরক্ষিত।
            </p>
          </div>

          <div className="flex items-center gap-6">
            <a href={`tel:${settings.hotline || "16234"}`} className="hover:text-white transition">
              হটলাইন: {settings.hotline || "16234"}
            </a>
            <Link href={selfCareHref} className="hover:text-orange-400 transition font-semibold">
              সেলফ-কেয়ার লগইন
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
