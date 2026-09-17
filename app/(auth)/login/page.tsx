"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/actions/auth.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/shared/alert";
import { Wifi, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginAction({ identifier, password });
      if (!res.success) {
        setError(res.message || "Failed to log in");
        setIsLoading(false);
        return;
      }

      router.push(res.redirectUrl || "/");
      router.refresh();
    } catch (err) {
      setError("An unexpected network error occurred.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-radial from-slate-100 to-slate-200 p-4 sm:p-6">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <Wifi className="h-7 w-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            NETCAFE
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Billing & Customer Management System
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Sign In</h2>
          <p className="text-xs sm:text-sm text-slate-500 mb-6">
            Enter your Admin email or Customer ID / Phone to continue.
          </p>

          {error && (
            <Alert type="error" message={error} className="mb-6" />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email, Customer ID, or Phone"
              placeholder="admin@example.com or CUST-0001"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              autoFocus
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          ISP Billing Management System • Bangladesh
        </p>
      </div>
    </div>
  );
}

