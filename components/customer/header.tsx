import React from "react";
import { getSession } from "@/lib/auth/session";
import { UserCheck } from "lucide-react";

interface CustomerHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export async function CustomerHeader({ title, description, children }: CustomerHeaderProps) {
  const session = await getSession();

  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {children}
        <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 shadow-2xs">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
            <UserCheck className="h-4 w-4" />
          </div>
          <div className="text-left">
            <span className="block text-xs font-semibold text-slate-900 leading-tight">
              {session?.name || "Customer"}
            </span>
            <span className="text-[11px] font-mono font-medium text-blue-600">
              {session?.customerCode || "CUST"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

