import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ISP Billing Management System",
  description: "Next.js + PostgreSQL ISP Billing & bKash Payment Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-100 selection:text-blue-900"
      >
        {children}
      </body>
    </html>
  );
}

