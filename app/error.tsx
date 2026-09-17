"use client";

import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log masked error safely on client or remote telemetry without leaking secrets
    console.error("Application error captured:", error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-500 mt-2">
            An unexpected error occurred while processing your request. Please try again or contact ISP support if the issue persists.
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button variant="primary" size="md" onClick={() => reset()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    </div>
  );
}

