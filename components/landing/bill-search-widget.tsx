"use client";

import React, { useState } from "react";
import Link from "next/link";
import { searchCustomerBillAction, BillSearchResult } from "@/app/actions/bill-search.actions";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import { Search, Loader2, CreditCard, CheckCircle2, AlertTriangle, Clock, ArrowRight, UserCheck, ShieldCheck, Zap } from "lucide-react";

export function BillSearchWidget() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BillSearchResult | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const res = await searchCustomerBillAction(query);
      setResult(res);
    } catch (err) {
      setResult({ success: false, message: "Search failed. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Top Banner: Instant Bill Payment Gateway Intro */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-xs font-semibold text-emerald-400">
          <Zap className="w-3.5 h-3.5" />
          <span>ইনস্ট্যান্ট বিল পেমেন্ট গেটওয়ে</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          ঘরে বসেই সহজে ও নিরাপদে আপনার বিল পরিশোধ করুন
        </h2>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
          কোনো ধরনের ঝামেলা ছাড়া bKash, Nagad, Rocket কিংবা কার্ডের মাধ্যমে মাত্র এক মিনিটে আপনার NETCAFE বিল পরিশোধ বা সংযোগ রিচার্জ করুন।
        </p>

        {/* Feature Highlights & Payment Partner Badges */}
        <div className="pt-2 flex flex-wrap justify-center items-center gap-4 text-xs font-medium text-slate-300">
          <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            ২৫৬-বিট SSL এনক্রিপ্টেড সুরক্ষিত পেমেন্ট গেটওয়ে
          </span>
          <span className="flex items-center gap-1.5 text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 rounded-full">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            পেমেন্ট সফল হওয়ার সাথে সাথে অটো-অ্যাক্টিভেশন
          </span>
        </div>

        {/* Supported Payment Logos */}
        <div className="pt-3 flex flex-wrap justify-center items-center gap-2 sm:gap-3 text-xs font-bold text-slate-200">
          <span className="px-3 py-1.5 rounded-xl bg-pink-950/60 border border-pink-500/40 text-pink-400">bKash</span>
          <span className="px-3 py-1.5 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-400">Nagad</span>
          <span className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/40 text-purple-400">Rocket</span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">Upay</span>
          <span className="px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-400">Visa / Master</span>
        </div>
      </div>

      {/* Bill Search Card Widget */}
      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 shadow-2xl shadow-indigo-950/40">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-semibold border border-orange-500/20 mb-2">
            <Search className="w-3.5 h-3.5" /> কুইক বিল পে পোর্টাল
          </span>
          <h3 className="text-xl sm:text-2xl font-bold text-white">গ্রাহক আইডি অথবা ফোন নম্বর দিন</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            সাবস্ক্রাইবার আইডি / ইউজারনেম / মোবাইল নম্বর (e.g. <span className="font-mono text-orange-300">CUST-1001</span> অথবা <span className="font-mono text-orange-300">017XXXXXXXX</span>)
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2.5 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="কাস্টমার আইডি বা ফোন নম্বর লিখুন..."
              className="w-full px-4 py-3.5 rounded-xl bg-slate-950 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                অনুসন্ধান হচ্ছে...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                বিল অনুসন্ধান করুন
              </>
            )}
          </button>
        </form>

        {/* Search Result Display */}
        {result && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 animate-in fade-in duration-200 max-w-2xl mx-auto">
            {!result.success ? (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs sm:text-sm flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-400" />
                <p>{result.message}</p>
              </div>
            ) : result.customer ? (
              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-5 space-y-4">
                {/* Customer Info Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">{result.customer.name}</h4>
                      <p className="text-xs text-indigo-400 font-mono">ID: {result.customer.customerCode}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    result.customer.status === "ACTIVE"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                  }`}>
                    {result.customer.status === "ACTIVE" ? "সক্রিয় গ্রাহক" : "স্থগিত / নিষ্ক্রিয়"}
                  </span>
                </div>

                {/* Bill Details */}
                {result.customer.latestBill ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[11px] text-slate-400 block">বিলের মাস</span>
                        <span className="text-sm font-bold text-slate-200">
                          {formatMonthYear(result.customer.latestBill.billingMonth, result.customer.latestBill.billingYear)}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80">
                        <span className="text-[11px] text-slate-400 block">বিলের পরিমাণ</span>
                        <span className="text-sm font-extrabold text-orange-400">
                          {formatCurrency(result.customer.totalDue)}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 col-span-2 sm:col-span-1">
                        <span className="text-[11px] text-slate-400 block">বিলের অবস্থা</span>
                        <div className="mt-0.5">
                          {result.customer.latestBill.status === "PAID" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" /> পরিশোধিত
                            </span>
                          ) : result.customer.latestBill.status === "PAYMENT_SUBMITTED" ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400">
                              <Clock className="w-3.5 h-3.5" /> পেন্ডিং যাচাই
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400">
                              <AlertTriangle className="w-3.5 h-3.5" /> বকেয়া
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* UNPAID / Due -> Prominent Pay button linking to Admin / Self-Care Portal */}
                    {result.customer.latestBill.status !== "PAID" && (
                      <div className="pt-2">
                        <Link
                          href={`/login?redirect=/portal/pay-bill&code=${result.customer.customerCode}`}
                          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-indigo-600 hover:from-orange-600 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-orange-500/25 transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                        >
                          <CreditCard className="w-4 h-4 text-orange-200" />
                          <span>bKash দিয়ে পরিশোধ করুন (পোর্টালে লগইন করুন)</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                        </Link>
                        <p className="text-[11px] text-center text-slate-400 mt-2">
                          বাটনে ক্লিক করলে সেলফ-কেয়ার কাস্টমার ও অ্যাডমিন পোর্টালে নিয়ে যাওয়া হবে।
                        </p>
                      </div>
                    )}

                    {result.customer.latestBill.status === "PAID" && (
                      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <p className="text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> আপনার সমস্ত চলতি বিল সম্পূর্ণ পরিশোধিত আছে! ধন্যবাদ।
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">কোনো নির্ধারিত বিল পাওয়া যায়নি।</p>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
