"use client";

import React from "react";
import { useLanguage } from "./language-context";
import { Star, Quote, Building2, Heart } from "lucide-react";

const testimonials = [
  {
    quote: {
      bn: "গত দুই বছর ধরে NETCAFE ব্যবহার করছি। জুম মিটিং কিংবা গিটহাব পুশে কখনো কোনো ল্যাগ বা ডিসকানেক্ট পাইনি। ফিল্ড সাপোর্ট টিম খুবই আন্তরিক।",
      en: "I've been using NETCAFE for two years. Zero lag during Zoom calls or GitHub pushes. The field support team is super proactive.",
    },
    name: { bn: "তানভীর আহমেদ", en: "Tanvir Ahmed" },
    role: { bn: "সফটওয়্যার ইঞ্জিনিয়ার ও রিমোট ওয়ার্কার • ধানমন্ডি, ঢাকা", en: "Software Engineer & Remote Worker • Dhanmondi, Dhaka" },
    avatar: "TA",
    rating: 5,
  },
  {
    quote: {
      bn: "গেমিং প্যাকেজে সিঙ্গাপুর সার্ভারে ১৫-১৮ এমএস পিং পাই। ভ্যালোরেন্ট ও পাবজি খেলায় কোনো লস নেই। স্ট্রিমারদের জন্য সেরা চয়েস।",
      en: "Getting 15-18ms ping to Singapore gaming servers. Zero packet loss in Valorant & PUBG. Best choice for live streamers!",
    },
    name: { bn: "নাবিল চৌধুরী", en: "Nabil Chowdhury" },
    role: { bn: "ইস্পোর্টস প্লেয়ার ও স্ট্রিমার • মিরপুর-১০, ঢাকা", en: "Esports Player & Streamer • Mirpur-10, Dhaka" },
    avatar: "NC",
    rating: 5,
  },
  {
    quote: {
      bn: "পরিবারের সবাই একসাথে টিভি, ইউটিউব ও নেটফ্লিক্স দেখি। বাফারলেস ৪K ভিডিও চলে। বিকাশ দিয়ে এক মিনিটে বিল দেওয়া যায়, খুবই সহজ!",
      en: "Everyone at home streams Netflix, YouTube & TV together smoothly in 4K. Paying bill via bKash takes just one minute!",
    },
    name: { bn: "ফারজানা হক", en: "Farzana Haq" },
    role: { bn: "হোম ইউজার ও গৃহিণী • উত্তরা, ঢাকা", en: "Home User • Uttara, Dhaka" },
    avatar: "FH",
    rating: 5,
  },
];

const corporatePartners = [
  "TechVerse BD",
  "Prime IT Solutions",
  "Apex Global",
  "NextGen Media",
  "Digital Soft",
  "Star Logistics",
];

export function Testimonials() {
  const { t } = useLanguage();

  return (
    <section className="py-20 bg-slate-950/80 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Testimonials Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-950/80 border border-rose-500/30 text-xs font-semibold text-rose-400">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>{t({ bn: "গ্রাহকদের প্রতিক্রিয়া", en: "Customer Reviews" })}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t({
              bn: "গ্রাহকদের সন্তুষ্টিই আমাদের শক্তি",
              en: "Customer Satisfaction Is Our Strength",
            })}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {t({
              bn: "হাজারো পরিবার ও শত শত কর্পোরেট প্রতিষ্ঠান প্রতিদিন NETCAFE-এর দ্রুতগতির ইন্টারনেটের উপর আস্থা রাখছেন।",
              en: "Thousands of families and hundreds of corporate firms trust NETCAFE's high-speed fiber internet every day.",
            })}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          {testimonials.map((item, idx) => (
            <div
              key={idx}
              className="p-7 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition duration-300 flex flex-col justify-between space-y-6 shadow-xl relative group"
            >
              <Quote className="w-8 h-8 text-indigo-500/20 group-hover:text-indigo-500/40 transition absolute top-6 right-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-1 text-amber-400">
                  {[...Array(item.rating)].map((_, rIdx) => (
                    <Star key={rIdx} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic">
                  "{t(item.quote)}"
                </p>
              </div>

              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-800">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-500 to-indigo-600 font-bold text-white text-xs flex items-center justify-center shadow-md">
                  {item.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t(item.name)}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t(item.role)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Corporate Partners Showcase */}
        <div className="pt-10 border-t border-slate-800/80 text-center space-y-6">
          <div className="inline-flex items-center gap-2 text-slate-400 text-xs uppercase font-bold tracking-widest">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>
              {t({
                bn: "শীর্ষস্থানীয় কর্পোরেট ও আইটি প্রতিষ্ঠানের বিশ্বস্ত সংযোগ সহযোগী",
                en: "Trusted Connectivity Partner For Leading Enterprise & IT Brands",
              })}
            </span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {corporatePartners.map((partner, idx) => (
              <div
                key={idx}
                className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-slate-300 font-bold text-xs sm:text-sm hover:border-indigo-500/40 hover:text-white transition"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

