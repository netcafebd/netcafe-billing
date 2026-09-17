import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wifi, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Wifi className="h-8 w-8" />
        </div>
        <div>
          <span className="text-4xl font-extrabold text-blue-600 block">404</span>
          <h1 className="text-xl font-bold text-slate-900 mt-2">Page Not Found</h1>
          <p className="text-sm text-slate-500 mt-1">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <div>
          <Link href="/">
            <Button variant="primary" size="md">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

