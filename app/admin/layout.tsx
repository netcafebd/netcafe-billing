import React from "react";
import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 mt-16 lg:mt-0 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

