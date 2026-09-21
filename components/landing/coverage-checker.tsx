"use client";

import React, { useState } from "react";
import { useLanguage } from "./language-context";
import { MapPin, CheckCircle2, PhoneCall, Compass, ArrowRight } from "lucide-react";

const defaultCoverageData = [
  {
    division: { bn: "ঢাকা", en: "Dhaka" },
    districts: [
      {
        name: { bn: "ঢাকা মেট্রো", en: "Dhaka Metro" },
        areas: [
          { name: { bn: "মিরপুর (১-১৪)", en: "Mirpur (1-14)" }, branch: "মিরপুর-১০ শাখা", hotline: "16234" },
          { name: { bn: "উত্তরা (সেক্টর ১-১৮)", en: "Uttara (Sector 1-18)" }, branch: "উত্তরা সেক্টর ৭ শাখা", hotline: "16234" },
          { name: { bn: "ধানমন্ডি ও শুক্রাবাদ", en: "Dhanmondi & Shukrabad" }, branch: "ধানমন্ডি ২৭ শাখা", hotline: "16234" },
          { name: { bn: "গুলশান ও বনানী", en: "Gulshan & Banani" }, branch: "গুলশান-২ কর্পোরেট হাব", hotline: "16234" },
          { name: { bn: "মোহাম্মদপুর ও আদাবর", en: "Mohammadpur & Adabor" }, branch: "রিং রোড সাব-অফিস", hotline: "16234" },
          { name: { bn: "বাড্ডা, রামপুরা ও আফতাবনগর", en: "Badda, Rampura & Aftabnagar" }, branch: "হাতিরঝিল লিঙ্ক রোড হাব", hotline: "16234" },
          { name: { bn: "পুরান ঢাকা (ওয়ারী, লালবাগ, বংশাল)", en: "Old Dhaka (Wari, Lalbagh)" }, branch: "র‌্যাঙ্কিন স্ট্রিট শাখা", hotline: "16234" },
          { name: { bn: "যাত্রাবাড়ী ও সায়েদাবাদ", en: "Jatrabari & Sayedabad" }, branch: "যাত্রাবাড়ী মোড় হাব", hotline: "16234" },
        ],
      },
      {
        name: { bn: "গাজীপুর", en: "Gazipur" },
        areas: [
          { name: { bn: "টঙ্গী ও বোর্ডবাজার", en: "Tongi & Boardbazar" }, branch: "টঙ্গী কলেজ রোড শাখা", hotline: "16234" },
          { name: { bn: "গাজীপুর চৌরাস্তা", en: "Gazipur Chowrasta" }, branch: "শিববাড়ি মোড় হাব", hotline: "16234" },
          { name: { bn: "কোনাবাড়ী ও কাশিমপুর", en: "Konabari & Kashimpur" }, branch: "কোনাবাড়ী শাখা", hotline: "16234" },
        ],
      },
    ],
  },
  {
    division: { bn: "চট্টগ্রাম", en: "Chattogram" },
    districts: [
      {
        name: { bn: "চট্টগ্রাম মেট্রো", en: "Chattogram Metro" },
        areas: [
          { name: { bn: "জিইসি ও নাসিরাবাদ", en: "GEC & Nasirabad" }, branch: "জিইসি সার্কেল ব্রাঞ্চ", hotline: "16234" },
          { name: { bn: "আগ্রাবাদ বাণিজ্যিক এলাকা", en: "Agrabad C/A" }, branch: "আগ্রাবাদ কমার্শিয়াল হাব", hotline: "16234" },
          { name: { bn: "হালিশহর ও পতেঙ্গা", en: "Halishahar & Patenga" }, branch: "বড়পোল শাখা", hotline: "16234" },
        ],
      },
    ],
  },
];

interface CoverageCheckerProps {
  onOpenOrderWithArea?: (areaName: string) => void;
  customCoverageText?: string;
  hotline?: string;
}

export function CoverageChecker({ onOpenOrderWithArea, customCoverageText, hotline }: CoverageCheckerProps) {
  const { t } = useLanguage();

  const [selectedDivisionIndex, setSelectedDivisionIndex] = useState(0);
  const [selectedDistrictIndex, setSelectedDistrictIndex] = useState(0);
  const [selectedArea, setSelectedArea] = useState<any>(null);

  const currentDivision = defaultCoverageData[selectedDivisionIndex];
  const currentDistrict = currentDivision?.districts[selectedDistrictIndex];
  const areas = currentDistrict?.areas || [];

  return (
    <section id="coverage" className="py-20 bg-slate-900/40 border-t border-slate-800/80 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-xs font-semibold text-indigo-300">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>{t({ bn: "দেশব্যাপী অপটিক্যাল ফাইবার নেটওয়ার্ক", en: "Nationwide Optical Fiber Network" })}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {t({
              bn: "আপনার এলাকায় আমাদের কভারেজ যাচাই করুন",
              en: "Check Fiber Coverage in Your Area",
            })}
          </h2>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
            {customCoverageText ||
              t({
                bn: "বিভাগ, জেলা এবং আপনার নিকটস্থ এলাকা নির্বাচন করে তাত্ক্ষণিকভাবে ফাইবার সংযোগের প্রাপ্যতা জেনে নিন।",
                en: "Select your division, district, and nearest neighborhood to instantly check optical fiber availability.",
              })}
          </p>
        </div>

        {/* Interactive Selector Box */}
        <div className="max-w-4xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-2xl shadow-indigo-950/30">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t({ bn: "বিভাগ নির্বাচন করুন:", en: "Select Division:" })}
              </label>
              <select
                value={selectedDivisionIndex}
                onChange={(e) => {
                  setSelectedDivisionIndex(parseInt(e.target.value));
                  setSelectedDistrictIndex(0);
                  setSelectedArea(null);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {defaultCoverageData.map((div, idx) => (
                  <option key={idx} value={idx}>
                    {t(div.division)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {t({ bn: "জেলা / মেট্রো নির্বাচন করুন:", en: "Select District / Metro:" })}
              </label>
              <select
                value={selectedDistrictIndex}
                onChange={(e) => {
                  setSelectedDistrictIndex(parseInt(e.target.value));
                  setSelectedArea(null);
                }}
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-indigo-500"
              >
                {currentDivision?.districts.map((dist, idx) => (
                  <option key={idx} value={idx}>
                    {t(dist.name)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-3">
              {t({ bn: "থানা বা এরিয়া নির্বাচন করুন:", en: "Select Your Area / Thana:" })}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
              {areas.map((area, idx) => {
                const isSelected = selectedArea?.name?.en === area.name.en;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedArea(area)}
                    className={`p-3.5 rounded-xl border text-left transition flex items-center justify-between ${
                      isSelected
                        ? "bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/20 ring-1 ring-indigo-500"
                        : "bg-slate-900/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className={`w-4 h-4 ${isSelected ? "text-orange-400" : "text-indigo-400"}`} />
                      <span className="text-xs sm:text-sm font-medium">{t(area.name)}</span>
                    </div>

                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {selectedArea && (
            <div className="mt-8 p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/40 flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1.5 text-center md:text-left">
                <div className="inline-flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {t({
                      bn: "আল্ট্রা-ফাস্ট অপটিক্যাল ফাইবার কভারেজ উপলব্ধ!",
                      en: "High-Speed Optical Fiber Coverage Available!",
                    })}
                  </span>
                </div>
                <h4 className="text-lg font-bold text-white">
                  {t(selectedArea.name)} ({selectedArea.branch})
                </h4>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => onOpenOrderWithArea && onOpenOrderWithArea(t(selectedArea.name))}
                  className="flex-1 md:flex-initial px-5 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2"
                >
                  <span>{t({ bn: "বুকিং করুন", en: "Book Now" })}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

