"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatMonthYear } from "@/lib/utils";
import {
  createCustomerAction,
  resetCustomerPasswordAction,
  updateCustomerStatusAction,
} from "@/app/actions/customer.actions";
import {
  Search,
  UserPlus,
  KeyRound,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { CustomerStatus } from "@prisma/client";

interface CustomerItem {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  monthlyBill: number;
  status: CustomerStatus;
  currentBill: {
    month: number;
    year: number;
    amount: number;
    status: string;
  } | null;
}

interface Props {
  customers: CustomerItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  defaultNextCode: string;
}

export function CustomerTableClient({
  customers,
  totalCount,
  currentPage,
  pageSize,
  defaultNextCode,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams?.get("status") || "ALL");

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [selectedCustomerCode, setSelectedCustomerCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Add form state
  const [addForm, setAddForm] = useState({
    customerCode: defaultNextCode,
    name: "",
    phone: "",
    email: "",
    address: "",
    monthlyBill: "800",
    initialPassword: "Customer123!",
    status: "ACTIVE",
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  function handleFilterSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus && selectedStatus !== "ALL") params.set("status", selectedStatus);
    params.set("page", "1");
    router.push(`/admin/customers?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    router.push(`/admin/customers?${params.toString()}`);
  }

  async function handleCreateCustomer(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setFormError(null);

    try {
      const res = await createCustomerAction({
        ...addForm,
        monthlyBill: parseFloat(addForm.monthlyBill),
      });

      if (!res.success) {
        setFormError(res.message || "Failed to create customer");
        setIsLoading(false);
        return;
      }

      setIsAddOpen(false);
      setAddForm({
        customerCode: "",
        name: "",
        phone: "",
        email: "",
        address: "",
        monthlyBill: "800",
        initialPassword: "Customer123!",
        status: "ACTIVE",
      });
      router.refresh();
    } catch (err) {
      setFormError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCustomerId) return;
    setIsLoading(true);
    setFormError(null);
    setFormSuccess(null);

    try {
      const res = await resetCustomerPasswordAction(selectedCustomerId, newPassword);
      if (!res.success) {
        setFormError(res.message || "Failed to reset password");
        setIsLoading(false);
        return;
      }

      setFormSuccess(res.message || "Password updated successfully!");
      setTimeout(() => {
        setIsResetOpen(false);
        setFormSuccess(null);
        setNewPassword("");
      }, 1500);
    } catch (err) {
      setFormError("An error occurred resetting password.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(customerId: string, status: CustomerStatus) {
    try {
      await updateCustomerStatusAction(customerId, status);
      router.refresh();
    } catch (err) {
      alert("Failed to update status");
    }
  }

  return (
    <div className="space-y-4">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleFilterSubmit} className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>

          <Button type="submit" variant="secondary" size="md">
            Filter
          </Button>
        </form>

        <Button
          variant="primary"
          onClick={() => {
            setFormError(null);
            setIsAddOpen(true);
          }}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-1.5" />
          Add Customer
        </Button>
      </div>

      {/* Customers Table Card */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Customer ID</th>
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Monthly Bill</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Current Bill</th>
                  <th className="py-3.5 px-4">Payment Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No customers found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {c.customerCode}
                      </td>
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          className="font-semibold text-slate-900 hover:text-blue-600 transition-colors"
                        >
                          {c.name}
                        </Link>
                        {c.email && <div className="text-xs text-slate-400">{c.email}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-700">{c.phone}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {formatCurrency(c.monthlyBill)}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        {c.currentBill ? (
                          <div className="text-xs">
                            <span className="font-medium text-slate-800">
                              {formatMonthYear(c.currentBill.month, c.currentBill.year)}:
                            </span>{" "}
                            <span className="font-semibold text-slate-900">
                              {formatCurrency(c.currentBill.amount)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">No bill</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {c.currentBill ? (
                          <StatusBadge status={c.currentBill.status} />
                        ) : (
                          <span className="text-xs text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link href={`/admin/customers/${c.id}`}>
                            <Button variant="ghost" size="sm" title="View details">
                              <ExternalLink className="h-4 w-4 text-slate-500" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCustomerId(c.id);
                              setSelectedCustomerCode(c.customerCode);
                              setNewPassword("");
                              setFormError(null);
                              setFormSuccess(null);
                              setIsResetOpen(true);
                            }}
                            title="Reset password"
                          >
                            <KeyRound className="h-4 w-4 text-amber-600" />
                          </Button>
                          {c.status === "ACTIVE" ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(c.id, "SUSPENDED")}
                              title="Suspend account"
                              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            >
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatusChange(c.id, "ACTIVE")}
                              title="Activate account"
                              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            >
                              Activate
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-xs text-slate-500">
                Showing Page {currentPage} of {totalPages} ({totalCount} subscribers)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Prev
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Customer Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => !isLoading && setIsAddOpen(false)}
        title="Add New Customer"
        description="Creates the subscriber profile and generates their login credentials."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateCustomer} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Customer ID"
              value={addForm.customerCode}
              onChange={(e) => setAddForm({ ...addForm, customerCode: e.target.value })}
              placeholder="e.g. CUST-0005"
              required
            />
            <Input
              label="Full Name"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="e.g. Rafiqul Islam"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={addForm.phone}
              onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
              placeholder="017XXXXXXXX"
              helperText="Used for customer login and notifications"
              required
            />
            <Input
              label="Email (Optional)"
              type="email"
              value={addForm.email}
              onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
              placeholder="customer@example.com"
            />
          </div>

          <Input
            label="Service Address"
            value={addForm.address}
            onChange={(e) => setAddForm({ ...addForm, address: e.target.value })}
            placeholder="Flat 3A, House 10, Road 2, Dhaka"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Monthly Bill Amount (৳)"
              type="number"
              min="1"
              value={addForm.monthlyBill}
              onChange={(e) => setAddForm({ ...addForm, monthlyBill: e.target.value })}
              required
            />
            <Select
              label="Account Status"
              value={addForm.status}
              onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>

          <Input
            label="Initial Portal Password"
            type="password"
            value={addForm.initialPassword}
            onChange={(e) => setAddForm({ ...addForm, initialPassword: e.target.value })}
            helperText="Customer can change this anytime after logging in"
            required
          />

          {formError && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {formError}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Customer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        isOpen={isResetOpen}
        onClose={() => !isLoading && setIsResetOpen(false)}
        title={`Reset Password for ${selectedCustomerCode}`}
        description="Set a new portal password for this customer."
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          <Input
            label="New Password"
            type="password"
            placeholder="Enter at least 6 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoFocus
          />

          {formError && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {formError}
            </p>
          )}

          {formSuccess && (
            <p className="text-xs text-emerald-700 font-medium bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              {formSuccess}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsResetOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

