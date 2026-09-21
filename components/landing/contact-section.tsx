"use client";

import React, { useState } from "react";
import { useLanguage } from "./language-context";
import { MapPin, PhoneCall, Mail, Send, CheckCircle2, Headphones, HelpCircle } from "lucide-react";

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
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="contact" className="py-20 border-t border-slate-800 bg-slate-950/90 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
                {t({ bn: "২৪/৭ হেল্পডেস্ক ও শাখা", en: "24/7 Helpdesk & Branches" })}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-white mt-3">
                {t({ bn: "আমাদের সাথে সরাসরি যোগাযোগ করুন", en: "Get In Touch With Our Team" })}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {t({
                  bn: "নতুন সংযোগ, কারিগরি সহায়তা বা কর্পোরেট সলিউশনের জন্য আমাদের হটলাইনে কল করুন অথবা সরাসরি মেসেজ পাঠিয়ে টিকিট খুলুন।",
                  en: "Have questions, technical issues, or need a new fiber connection? Call our 24/7 hotline or drop a message.",
                })}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <MapPin className="w-6 h-6 text-orange-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t({ bn: "প্রধান কার্যালয় (গুলশান হাব)", en: "Corporate Office (Gulshan Hub)" })}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {officeAddress || "লেভেল-৭, টাওয়ার-এ, গুলশান সাউথ এভিনিউ, গুলশান-২, ঢাকা-১২১২"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <PhoneCall className="w-6 h-6 text-indigo-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t({ bn: "হটলাইন ও ফোন নম্বর", en: "Hotline & Support Numbers" })}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    হটলাইন: <span className="font-bold text-orange-400">{hotline || "১৬২৩৪"}</span> (২৪ ঘণ্টা খোলা) | হেল্পলাইন: {supportPhone || "+880 9611 800 800"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <Mail className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                <div>
                  <h4 className="text-sm font-bold text-white">{t({ bn: "ইমেইল অ্যাড্রেস", en: "Official Emails" })}</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {email || "support@netcafebd.com"} | billing@netcafebd.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">{t({ bn: "অনলাইন হেল্পডেস্ক বা বার্তা পাঠান", en: "Send A Message / Helpdesk Ticket" })}</h3>
            <p className="text-xs text-slate-400">
              {t({ bn: "আপনার তথ্য দিন, আমাদের প্রতিনিধি দ্রুততম সময়ে যোগাযোগ করবেন।", en: "Fill out your details and our team will get back to you shortly." })}
            </p>

            {submitted ? (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{t({ bn: "আপনার বার্তা সফলভাবে পাঠানো হয়েছে! আমাদের কাস্টমার কেয়ার টিম দ্রুত যোগাযোগ করবে।", en: "Message sent successfully! Our customer care team will reach out soon." })}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t({ bn: "আপনার নাম*", en: "Your Name*" })}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. আবরার রহমান"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t({ bn: "মোবাইল নম্বর*", en: "Mobile Phone*" })}
                    </label>
                    <input
                      type="tel"
                      placeholder="01XXXXXXXXX"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t({ bn: "বিষয়ের ধরন", en: "Subject Type" })}
                  </label>
                  <select className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500">
                    <option>{t({ bn: "সাধারণ জিজ্ঞাসা", en: "General Query" })}</option>
                    <option>{t({ bn: "নতুন সংযোগ আবেদন", en: "New Connection Request" })}</option>
                    <option>{t({ bn: "বিলিং ও পেমেন্ট সমস্যা", en: "Billing & Payment Issue" })}</option>
                    <option>{t({ bn: "টেকনিক্যাল সাপোর্ট ও কমপ্লেন", en: "Technical Support & Complaint" })}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t({ bn: "আপনার বার্তা / সমস্যা বিস্তারিত লিখুন", en: "Your Message Details" })}
                  </label>
                  <textarea
                    placeholder="এখানে বিস্তারিত লিখুন..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <Send className="w-4 h-4" />
                  <span>{t({ bn: "বার্তা পাঠান", en: "Send Message" })}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
