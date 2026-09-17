"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { changePasswordAction } from "@/app/actions/auth.actions";
import { Lock, CheckCircle2 } from "lucide-react";

export function ProfilePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
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

      setSuccess("Your portal password was updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Current Password"
        type="password"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="New Password"
          type="password"
          placeholder="At least 6 characters"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <Input
          label="Confirm New Password"
          type="password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
          {error}
        </p>
      )}

      {success && (
        <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          {success}
        </p>
      )}

      <Button type="submit" variant="primary" isLoading={isLoading} className="w-full sm:w-auto">
        <Lock className="h-4 w-4 mr-1.5" />
        Update Password
      </Button>
    </form>
  );
}

