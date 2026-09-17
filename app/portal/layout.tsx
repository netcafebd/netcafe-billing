import React from "react";
import { CustomerSidebar } from "@/components/customer/sidebar";
import { requireCustomer } from "@/lib/auth/session";

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireCustomer();

  return (
    <div className="min-h-screen bg-slate-50">
      <CustomerSidebar />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8 mt-16 lg:mt-0 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

