"use client";

import React, { useState } from "react";
import { useLanguage } from "./language-context";
import { submitContactMessageAction } from "@/app/actions/inquiries.actions";
import { MapPin, PhoneCall, Mail, Send, CheckCircle2, Headphones, AlertCircle, Loader2, MessageCircle } from "lucide-react";

// Unicode Surrogate Pairs for 100% reliable WhatsApp Emojis across all build tools & OS
const EMOJI = {
  ENVELOPE: "\uD83D\uDCE9", // 📩
  USER: "\uD83D\uDC64",     // 👤
  PHONE: "\uD83D\uDCDE",    // 📞
  PUSHPIN: "\uD83D\uDCCC",  // 📌
  CHAT: "\uD83D\uDCAC",     // 💬
};

interface ContactSectionProps {
  hotline?: string;
  supportPhone?: string;
  email?: string;
  officeAddress?: string;
  whatsappNumber?: string;
}

export function ContactSection({ hotline, supportPhone, email, officeAddress, whatsappNumber }: ContactSectionProps) {
  const { t } = useLanguage();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("সাধারণ জিজ্ঞাসা");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [waLink, setWaLink] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await submitContactMessageAction({
        name,
        phone,
        subject,
        message,
      });

      if (res.success) {
        setSubmitted(true);

        // Build WhatsApp Alert URL with full unicode surrogate pairs
        const messageText = `${EMOJI.ENVELOPE} *NETCAFE ওয়েবসাইট নতুন মেসেজ / সাপোর্ট টিকিট* ${EMOJI.ENVELOPE}
----------------------------------------
${EMOJI.USER} *প্রেরকের নাম:* ${name}
${EMOJI.PHONE} *মোবাইল নম্বর:* ${phone}
${EMOJI.PUSHPIN} *বিষয়:* ${subject}
${EMOJI.CHAT} *মেসেজ:* ${message}
----------------------------------------
*NETCAFE Helpdesk System*`;

        const targetWaNumber = (whatsappNumber || "8801622280960").replace(/[^0-9]/g, "");
        const waUrl = `https://api.whatsapp.com/send?phone=${targetWaNumber}&text=${encodeURIComponent(messageText)}`;
        setWaLink(waUrl);

        try {
          window.open(waUrl, "_blank");
        } catch (_) {}

        setName("");
        setPhone("");
        setMessage("");
      } else {
        setErrorMsg(res.message || "মেসেজ পাঠানো সম্ভব হয়নি। আবার চেষ্টা করুন।");
      }
    } catch (err: any) {
      setErrorMsg("Error submitting message.");
    } finally {
      setSubmitting(false);
    }
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
              {t({ bn: "আপনার তথ্য দিন, আমাদের প্রতিনিধি ডাটাবেজ ও WhatsApp এ নোটিফিকেশন পেয়ে দ্রুত যোগাযোগ করবেন।", en: "Fill out your details and our team will get back to you shortly." })}
            </p>

            {submitted ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>{t({ bn: "আপনার বার্তা সফলভাবে জমা হয়েছে এবং WhatsApp এ নোটিফিকেশন পাঠানো হয়েছে!", en: "Message saved & sent to WhatsApp successfully!" })}</span>
                </div>

                {waLink && (
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <MessageCircle className="w-4 h-4 fill-current" />
                    <span>WhatsApp এ সরাসরি নোটিফিকেশন চালু করুন {EMOJI.CHAT}</span>
                  </a>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      {t({ bn: "আপনার নাম*", en: "Your Name*" })}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
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
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="সাধারণ জিজ্ঞাসা">{t({ bn: "সাধারণ জিজ্ঞাসা", en: "General Query" })}</option>
                    <option value="নতুন সংযোগ আবেদন">{t({ bn: "নতুন সংযোগ আবেদন", en: "New Connection Request" })}</option>
                    <option value="বিলিং ও পেমেন্ট সমস্যা">{t({ bn: "বিলিং ও পেমেন্ট সমস্যা", en: "Billing & Payment Issue" })}</option>
                    <option value="টেকনিক্যাল সাপোর্ট ও কমপ্লেন">{t({ bn: "টেকনিক্যাল সাপোর্ট ও কমপ্লেন", en: "Technical Support & Complaint" })}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    {t({ bn: "আপনার বার্তা / সমস্যা বিস্তারিত লিখুন", en: "Your Message Details" })}
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="এখানে বিস্তারিত লিখুন..."
                    rows={4}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>পাঠানো হচ্ছে...</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      <span>{t({ bn: "বার্তা পাঠান (WhatsApp নোটিফিকেশন সহ)", en: "Send Message (With WhatsApp Alert)" })}</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
