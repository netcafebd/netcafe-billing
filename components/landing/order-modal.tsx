"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "./language-context";
import { submitConnectionRequestAction } from "@/app/actions/inquiries.actions";
import { X, Zap, CheckCircle2, ShieldCheck, PhoneCall, MapPin, User, AlertCircle, MessageCircle } from "lucide-react";

// Unicode Surrogate Pairs for 100% reliable WhatsApp Emojis across all build tools & OS
const EMOJI = {
  GLOBE: "\uD83C\uDF10",   // 🌐
  ID: "\uD83C\uDD94",      // 🆔
  USER: "\uD83D\uDC64",    // 👤
  MOBILE: "\uD83D\uDCF1",  // 📱
  PACKAGE: "\uD83D\uDCE6", // 📦
  PIN: "\uD83D\uDCCD",     // 📍
  HOME: "\uD83C\uDFE0",    // 🏠
  CHAT: "\uD83D\uDCAC",    // 💬
};

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPackage?: any;
  initialArea?: string;
  hotline?: string;
  whatsappNumber?: string;
}

export function OrderModal({ isOpen, onClose, initialPackage, initialArea, hotline, whatsappNumber }: OrderModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    area: "",
    address: "",
    packageName: "সুপার ফ্যামিলি (60 Mbps - ৳1000)",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refId, setRefId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [waLink, setWaLink] = useState("");

  useEffect(() => {
    if (initialPackage) {
      const pkgName = typeof initialPackage.name === "object" ? t(initialPackage.name) : initialPackage.name;
      setFormData((prev) => ({
        ...prev,
        packageName: `${pkgName} (${initialPackage.speed} - ৳${initialPackage.price})`,
      }));
    }
    if (initialArea) {
      setFormData((prev) => ({
        ...prev,
        area: initialArea,
      }));
    }
  }, [initialPackage, initialArea]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;

    setSubmitting(true);
    setErrorMsg("");

    try {
      const res = await submitConnectionRequestAction({
        name: formData.name,
        phone: formData.phone,
        packageName: formData.packageName,
        area: formData.area,
        address: formData.address,
      });

      if (res.success && res.referenceCode) {
        const trackingCode = res.referenceCode;
        setRefId(trackingCode);
        setSubmitted(true);

        // Clean WhatsApp Message format without markdown asterisks breaking Bengali diacritics
        const messageText = `${EMOJI.GLOBE} NETCAFE নতুন ফাইবার সংযোগ আবেদন

${EMOJI.ID} রেফারেন্স: ${trackingCode}
${EMOJI.USER} নাম: ${formData.name}
${EMOJI.MOBILE} মোবাইল: ${formData.phone}
${EMOJI.PACKAGE} প্যাকেজ: ${formData.packageName}
${EMOJI.PIN} এলাকা: ${formData.area || "N/A"}
${EMOJI.HOME} ঠিকানা: ${formData.address || "N/A"}

NETCAFE Fiber Broadband`;

        const targetWaNumber = (whatsappNumber || "8801622280960").replace(/[^0-9]/g, "");
        const waUrl = `https://api.whatsapp.com/send?phone=${targetWaNumber}&text=${encodeURIComponent(messageText)}`;
        setWaLink(waUrl);

        // Auto open WhatsApp notification
        try {
          window.open(waUrl, "_blank");
        } catch (_) {}
      } else {
        setErrorMsg(res.message || "আবেদন জমা নেওয়া সম্ভব হয়নি। আবার চেষ্টা করুন।");
      }
    } catch (err: any) {
      setErrorMsg("Error submitting request.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl p-6 sm:p-8 text-left">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="text-center py-6 space-y-4 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-black text-white">
              {t({ bn: "সংযোগ বুকিং সফল হয়েছে!", en: "Connection Request Received!" })}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
              {t({
                bn: "আপনার নতুন অপটিক্যাল ফাইবার সংযোগের আবেদনটি ডাটাবেজে সংরক্ষিত হয়েছে এবং WhatsApp নোটিফিকেশন পাঠানো হয়েছে। রেফারেন্স ট্র্যাকিং কোড:",
                en: "Your connection request is saved in system & sent to WhatsApp. Reference code:",
              })}
            </p>

            <div className="inline-block px-4 py-2 rounded-xl bg-slate-900 border border-indigo-500/40 text-orange-400 font-mono font-bold text-lg">
              {refId}
            </div>

            {waLink && (
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                <span>WhatsApp এ মেসেজ নোটিফিকেশন খুলুন {EMOJI.CHAT}</span>
              </a>
            )}

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2 text-left">
              <p className="flex items-center gap-2 text-slate-200 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t({ bn: "ফ্রি ফাইবার ইনস্টলেশন অফার প্রযোজ্য", en: "Free Fiber Installation offer applied" })}</span>
              </p>
              <p>
                {t({
                  bn: `আমাদের প্রতিনিধি এবং ফিল্ড টেকনিশিয়ান আপনার সাথে দ্রুত যোগাযোগ করে ফাইবার লাইন সেটআপ সম্পন্ন করবেন। প্রয়োজন হটলাইন: ${hotline || "১৬২৩৪"}।`,
                  en: `Our team will call you shortly to setup your line. Hotline: ${hotline || "16234"}.`,
                })}
              </p>
            </div>

            <button
              onClick={handleClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm"
            >
              {t({ bn: "ঠিক আছে", en: "Done" })}
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-2">
                <Zap className="w-3.5 h-3.5" />
                <span>{t({ bn: "ফ্রি ইনস্টলেশন ক্যাম্পেইন", en: "Free Installation Campaign" })}</span>
              </div>
              <h3 className="text-2xl font-black text-white">
                {t({ bn: "নতুন সংযোগ আবেদন ফর্ম", en: "New Connection Application" })}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t({
                  bn: "আপনার তথ্য দিন, আমাদের টিম ডাটাবেজ ও WhatsApp এ নোটিফিকেশন পেয়ে দ্রুত ফাইবার লাইন সংযোগ দেবে।",
                  en: "Fill in the details below and get connected to high-speed fiber.",
                })}
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {t({ bn: "নির্বাচিত প্যাকেজ", en: "Selected Package" })}
                </label>
                <input
                  type="text"
                  readOnly
                  value={formData.packageName}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-orange-400 font-semibold text-xs sm:text-sm cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t({ bn: "আপনার নাম", en: "Your Full Name" })} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="যেমন: রাশেদ আহমেদ"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t({ bn: "মোবাইল নম্বর", en: "Mobile Phone" })} *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="017XXXXXXXX"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t({ bn: "এলাকা / থানা", en: "Area / Thana" })}
                  </label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    placeholder="যেমন: মিরপুর-১০, ঢাকা"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {t({ bn: "বিস্তারিত ঠিকানা", en: "Full Address" })}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="বাসা/হোল্ডিং নম্বর, রোড..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {submitting
                    ? t({ bn: "সাবমিট হচ্ছে...", en: "Submitting Request..." })
                    : t({ bn: "আবেদন করুন (WhatsApp নোটিফিকেশন সহ)", en: "Submit Order (With WhatsApp Alert)" })}
                </span>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
