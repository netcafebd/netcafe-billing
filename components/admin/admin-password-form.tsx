"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/app/actions/auth.actions";
import { Lock, CheckCircle2, ShieldCheck, Eye, EyeOff } from "lucide-react";

export function AdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await changePasswordAction({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (!res.success) {
        setError(res.message || "Failed to update password");
        setIsLoading(false);
        return;
      }

      setSuccess("Admin password updated successfully! Please use this new password for your next login.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("An unexpected error occurred while updating password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="relative">
        <Input
          label="Current Admin Password"
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Enter current password"
          required
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-hidden"
          aria-label={showCurrent ? "Hide password" : "Show password"}
        >
          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Input
            label="New Password"
            type={showNew ? "text" : "password"}
            placeholder="At least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowNew(!showNew)}
            className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-hidden"
            aria-label={showNew ? "Hide password" : "Show password"}
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="relative">
          <Input
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            placeholder="Repeat new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 focus:outline-hidden"
            aria-label={showConfirm ? "Hide password" : "Show password"}
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium bg-rose-50 p-3 rounded-xl border border-rose-200">
          {error}
        </p>
      )}

      {success && (
        <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {success}
        </p>
      )}

      <div className="pt-2">
        <Button type="submit" variant="primary" size="md" isLoading={isLoading}>
          <ShieldCheck className="h-4 w-4 mr-1.5" />
          Update Admin Password
        </Button>
      </div>
    </form>
  );
}

