import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireCustomer } from "@/lib/auth/session";
import { CustomerHeader } from "@/components/customer/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ProfilePasswordForm } from "./profile-password-form";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Wifi,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CustomerProfilePage() {
  const session = await requireCustomer();

  const customer = await prisma.customer.findUnique({
    where: { id: session.customerId },
    include: {
      user: {
        select: { email: true, role: true },
      },
    },
  });

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return (
    <div className="space-y-6">
      <CustomerHeader
        title="Subscriber Profile"
        description="View your account configuration and manage your portal login password."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Account Details Card (Read-only for sensitive fields) */}
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-blue-600" />
                Subscription Details
              </CardTitle>
              <CardDescription>
                Account status, ID, and plan rates are managed by your ISP administrator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Customer ID</span>
                  <span className="font-mono text-base font-bold text-blue-600">
                    {customer.customerCode}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Account Status</span>
                  <div className="mt-1">
                    <StatusBadge status={customer.status} />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Monthly Plan Rate</span>
                  <span className="text-base font-bold text-slate-900">
                    {formatCurrency(customer.monthlyBill.toString())}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs text-slate-400 block font-medium">Connection Date</span>
                  <span className="text-sm font-medium text-slate-800">
                    {formatDate(customer.connectionDate)}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-3 text-sm">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                  <User className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-xs text-slate-400 block">Full Name</span>
                    <span className="font-semibold text-slate-900">{customer.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-xs text-slate-400 block">Registered Phone</span>
                    <span className="font-mono font-medium text-slate-900">{customer.phone}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <span className="text-xs text-slate-400 block">Account Email</span>
                    <span className="font-medium text-slate-900">
                      {customer.email || customer.user.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-100">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <span className="text-xs text-slate-400 block">Installation Address</span>
                    <span className="font-medium text-slate-900">{customer.address}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Change Password Card */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-600" />
                Security & Password
              </CardTitle>
              <CardDescription>
                Change your portal login password anytime to secure your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfilePasswordForm />
            </CardContent>
          </Card>

          <Card className="bg-blue-50/50 border-blue-100">
            <CardContent className="p-5 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Data Privacy Guarantee:</span>
                <p>
                  Your billing information and payment receipts are private and secured using encrypted sessions. Only you and authorized ISP billing operators can view your account history.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

