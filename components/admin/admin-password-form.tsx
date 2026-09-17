"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateAdminAccountAction } from "@/app/actions/auth.actions";
import { Lock, CheckCircle2, ShieldCheck, Mail, Eye, EyeOff } from "lucide-react";

interface AdminPasswordFormProps {
  initialEmail?: string;
}

export function AdminPasswordForm({ initialEmail = "admin@example.com" }: AdminPasswordFormProps) {
  const [email, setEmail] = useState(initialEmail);
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

    if (!currentPassword) {
      setError("Please enter your current password to authorize changes.");
      return;
    }

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      if (newPassword.length < 6) {
        setError("New password must be at least 6 characters long.");
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updateAdminAccountAction({
        newEmail: email,
        currentPassword,
        newPassword: newPassword || undefined,
      });

      if (!res.success) {
        setError(res.message || "Failed to update admin account.");
        setIsLoading(false);
        return;
      }

      setSuccess(res.message || "Admin account updated successfully!");
      if (res.newEmail) {
        setEmail(res.newEmail);
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("An unexpected error occurred while updating account.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
      {/* Admin Email Input */}
      <div>
        <Input
          label="Admin Login Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@example.com"
          required
        />
        <p className="text-xs text-slate-400 mt-1">
          Use this email address to log in to your NETCAFE admin dashboard.
        </p>
      </div>

      {/* Current Password (Required to confirm changes) */}
      <div className="relative pt-2 border-t border-slate-100">
        <Input
          label="Current Admin Password *"
          type={showCurrent ? "text" : "password"}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Required to authorize email or password change"
          required
        />
        <button
          type="button"
          onClick={() => setShowCurrent(!showCurrent)}
          className="absolute right-3 top-11 text-slate-400 hover:text-slate-600 focus:outline-hidden"
          aria-label={showCurrent ? "Hide password" : "Show password"}
        >
          {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {/* New Password (Optional) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <div className="relative">
          <Input
            label="New Password (Optional)"
            type={showNew ? "text" : "password"}
            placeholder="Leave blank to keep current"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
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
          Save Account Changes
        </Button>
      </div>
    </form>
  );
}
