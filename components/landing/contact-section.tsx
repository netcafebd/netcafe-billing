"use client";

import React, { useState } from "react";
import { useLanguage } from "./language-context";
import { MapPin, PhoneCall, Mail, Send, CheckCircle2, Headphones } from "lucide-react";

interface ContactSectionProps {
  hotline?: string;
  supportPhone?: string;
  email?: string;
  officeAddress?: string;
}

export function ContactSection({ hotline, supportPhone, email, officeAddress }: ContactSectionProps) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section id="contact" className="py-20 border-t border-slate-800 bg-slate-950/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                {t({ bn: "যোগাযোগ", en: "Contact Us" })}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
                {t({ bn: "আমাদের সাথে সরাসরি যোগাযোগ করুন", en: "Get In Touch With Our Team" })}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2">
                {t({
                  bn: "যেকোনো জিজ্ঞাসা, অভিযোগ বা নতুন সংযোগের জন্য আমাদের সাথে কথা বলুন।",
                  en: "Have questions or need a new fiber connection? Talk to our 24/7 team.",
                })}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <MapPin className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t({ bn: "অফিসের ঠিকানা", en: "Corporate Office" })}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {officeAddress || "হাউজ #১২, রোড #০৪, ব্লক #বি, ঢাকা-১২১৬, বাংলাদেশ"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <PhoneCall className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t({ bn: "হটলাইন ও ফোন নম্বর", en: "Hotline & Support" })}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    হটলাইন: <span className="font-bold text-orange-400">{hotline || "16234"}</span> | হেল্পলাইন: {supportPhone || "+880 9612-000111"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <Mail className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t({ bn: "ইমেইল অ্যাড্রেস", en: "Email Support" })}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">{email || "support@netcafe-bd.com"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">{t({ bn: "মেসেজ পাঠান", en: "Send Us A Message" })}</h3>
            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>{t({ bn: "আপনার মেসেজ সফলভাবে পাঠানো হয়েছে! দ্রুত উত্তর দেওয়া হবে।", en: "Message sent successfully! We will get back to you shortly." })}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder={t({ bn: "আপনার নাম", en: "Your Name" })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="tel"
                  placeholder={t({ bn: "ফোন নম্বর", en: "Phone Number" })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
                <textarea
                  placeholder={t({ bn: "আপনার মেসেজ...", en: "Your Message..." })}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{t({ bn: "মেসেজ পাঠান", en: "Send Message" })}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
