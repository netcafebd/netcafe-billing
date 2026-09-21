"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { updateISPSettingsAction } from "@/app/actions/settings.actions";
import { QrCode, Phone, CheckCircle2, Copy } from "lucide-react";
import { DEFAULT_BKASH_QR_IMAGE, getEffectiveBkashQr } from "@/lib/constants/qr";

interface SettingsFormProps {
  initialSettings: {
    ispName: string;
    supportPhone: string;
    hotline: string;
    whatsappNumber?: string;
    email: string;
    officeAddress: string;
    bkashNumber: string;
    bkashQrCode: string;
    paymentInstructions: string;
    heroTitle: string;
    heroSubtitle: string;
    heroNotice: string;
    coverageArea: string;
    packagesJson: string;
    whyUsJson: string;
    ftpServersJson: string;
  };
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [form, setForm] = useState({
    ...initialSettings,
    whatsappNumber: initialSettings.whatsappNumber || "8801622280960",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setStatusMessage(null);

    try {
      const res = await updateISPSettingsAction(form);
      if (!res.success) {
        setStatusMessage({ type: "error", text: res.message });
        setIsLoading(false);
        return;
      }

      setStatusMessage({ type: "success", text: "ISP & website settings saved successfully!" });
    } catch (err) {
      setStatusMessage({ type: "error", text: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Settings Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">ISP & Website Information</CardTitle>
          <CardDescription>
            Configure all content rendered live on the main Netcafe BD website and customer portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="ISP Brand Name"
                value={form.ispName}
                onChange={(e) => setForm({ ...form, ispName: e.target.value })}
                required
              />
              <Input
                label="Hotline Number (Top Bar)"
                value={form.hotline}
                onChange={(e) => setForm({ ...form, hotline: e.target.value })}
                helperText="e.g. 16234"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Support Helpline Phone"
                value={form.supportPhone}
                onChange={(e) => setForm({ ...form, supportPhone: e.target.value })}
                required
              />
              <Input
                label="WhatsApp Hotline Number"
                value={form.whatsappNumber}
                onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                helperText="Format: 8801XXXXXXXXX (New orders & messages send WhatsApp alert to this number!)"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Support Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                label="ISP bKash Number (Send Money)"
                value={form.bkashNumber}
                onChange={(e) => setForm({ ...form, bkashNumber: e.target.value })}
                helperText="Must be a valid 11-digit bKash number"
                required
              />
            </div>

            <Input
              label="Office Address"
              value={form.officeAddress}
              onChange={(e) => setForm({ ...form, officeAddress: e.target.value })}
            />

            <Textarea
              label="bKash QR Code (SVG or Data URL)"
              value={form.bkashQrCode}
              onChange={(e) => setForm({ ...form, bkashQrCode: e.target.value })}
              helperText="Paste SVG markup or data:image URL to display bKash QR code."
              rows={3}
            />

            <Textarea
              label="Payment Instructions for Customers"
              value={form.paymentInstructions}
              onChange={(e) => setForm({ ...form, paymentInstructions: e.target.value })}
              helperText="Step-by-step guidance shown on the customer's Pay Bill page."
              rows={3}
              required
            />

            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                🌐 Main Website Landing Page Content (netcafe-bd.com)
              </h4>

              <div className="space-y-3">
                <Input
                  label="Hero Notice Banner (Offer Notice)"
                  value={form.heroNotice}
                  onChange={(e) => setForm({ ...form, heroNotice: e.target.value })}
                  helperText="Top announcement text"
                />

                <Input
                  label="Hero Headline Title"
                  value={form.heroTitle}
                  onChange={(e) => setForm({ ...form, heroTitle: e.target.value })}
                  helperText="Main title shown on home page hero banner"
                />

                <Textarea
                  label="Hero Description / Subtitle"
                  value={form.heroSubtitle}
                  onChange={(e) => setForm({ ...form, heroSubtitle: e.target.value })}
                  rows={2}
                />

                <Input
                  label="Coverage Area Text"
                  value={form.coverageArea}
                  onChange={(e) => setForm({ ...form, coverageArea: e.target.value })}
                />

                <Textarea
                  label="Package Pricing Configuration (JSON)"
                  value={form.packagesJson}
                  onChange={(e) => setForm({ ...form, packagesJson: e.target.value })}
                  helperText="JSON array for ISP package names, speeds, and monthly prices."
                  rows={3}
                />

                <Textarea
                  label="Why Choose Us Features (JSON)"
                  value={form.whyUsJson}
                  onChange={(e) => setForm({ ...form, whyUsJson: e.target.value })}
                  helperText="JSON array for Why Choose Us section cards."
                  rows={3}
                />

                <Textarea
                  label="FTP & Media Servers (JSON)"
                  value={form.ftpServersJson}
                  onChange={(e) => setForm({ ...form, ftpServersJson: e.target.value })}
                  helperText="JSON array for FTP servers and Live TV links."
                  rows={3}
                />
              </div>
            </div>

            {statusMessage && (
              <div
                className={`p-3 rounded-xl border text-xs font-medium ${
                  statusMessage.type === "error"
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {statusMessage.text}
              </div>
            )}

            <Button type="submit" variant="primary" isLoading={isLoading} className="w-full">
              Save Configuration
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Live Preview Card */}
      <div className="space-y-4">
        <Card className="border-pink-200 bg-linear-to-b from-pink-50/40 to-white">
          <CardHeader className="border-b border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base text-pink-900">
                  Customer Portal Live Preview
                </CardTitle>
                <CardDescription>
                  This is how subscribers will see your bKash payment box.
                </CardDescription>
              </div>
              <span className="rounded-full bg-[#e2136e] px-2.5 py-1 text-[10px] font-bold text-white uppercase tracking-wider">
                Live Preview
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h4 className="font-bold text-slate-900 text-base">{form.ispName}</h4>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="h-3 w-3 text-slate-400" />
                  Support: {form.supportPhone} | WhatsApp: {form.whatsappNumber}
                </p>
              </div>
              <span className="text-xs font-semibold text-[#e2136e] bg-pink-100 px-2.5 py-1 rounded-full">
                bKash Send Money
              </span>
            </div>

            {/* bKash Number Box */}
            <div className="rounded-xl border border-pink-200 bg-white p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <span className="text-xs text-slate-500 block">ISP bKash Number</span>
                <span className="font-mono text-xl font-extrabold text-[#e2136e]">
                  {form.bkashNumber}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="text-[#e2136e] border-pink-200 hover:bg-pink-50 text-xs shrink-0"
              >
                <Copy className="h-3.5 w-3.5 mr-1" />
                Copy Number
              </Button>
            </div>

            {/* QR Code display */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-slate-200">
              <span className="text-xs font-medium text-slate-500 mb-2">Scan with bKash App</span>
              {(() => {
                const qrSrc = getEffectiveBkashQr(form.bkashQrCode);

                return qrSrc.startsWith("<svg") ? (
                  <div
                    className="h-44 w-44 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: qrSrc }}
                  />
                ) : (
                  <img
                    src={qrSrc}
                    alt="bKash QR Code"
                    className="h-44 w-44 object-contain rounded-lg border border-slate-100 p-2"
                  />
                );
              })()}
            </div>

            {/* Instructions */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
              <span className="font-bold text-slate-900 block mb-1">
                Payment Instructions:
              </span>
              {form.paymentInstructions}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
