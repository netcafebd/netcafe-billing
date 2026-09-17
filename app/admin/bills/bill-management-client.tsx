"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { StatusBadge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatMonthYear, MONTH_NAMES } from "@/lib/utils";
import {
  generateMonthlyBillsAction,
  createBillAction,
  syncOverdueBillsAction,
} from "@/app/actions/bill.actions";
import {
  Search,
  Receipt,
  PlusCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { BillStatus } from "@prisma/client";

interface BillItem {
  id: string;
  customerCode: string;
  customerName: string;
  phone: string;
  billingMonth: number;
  billingYear: number;
  amount: number;
  dueDate: string;
  status: BillStatus;
  paidAt: string | null;
}

interface CustomerOption {
  id: string;
  customerCode: string;
  name: string;
  monthlyBill: number;
}

interface Props {
  bills: BillItem[];
  customers: CustomerOption[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  currentMonth: number;
  currentYear: number;
}

export function BillManagementClient({
  bills,
  customers,
  totalCount,
  currentPage,
  pageSize,
  currentMonth,
  currentYear,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "");
  const [selectedStatus, setSelectedStatus] = useState(searchParams?.get("status") || "ALL");
  const [selectedMonth, setSelectedMonth] = useState(searchParams?.get("month") || "ALL");
  const [selectedYear, setSelectedYear] = useState(searchParams?.get("year") || currentYear.toString());

  // Modals
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isCreateSingleOpen, setIsCreateSingleOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);

  // Generate form state
  const [genForm, setGenForm] = useState({
    billingMonth: currentMonth.toString(),
    billingYear: currentYear.toString(),
    dueDay: "10",
  });

  // Single bill form state
  const [singleForm, setSingleForm] = useState({
    customerId: customers[0]?.id || "",
    billingMonth: currentMonth.toString(),
    billingYear: currentYear.toString(),
    amount: customers[0]?.monthlyBill?.toString() || "800",
    dueDate: new Date(Date.UTC(currentYear, currentMonth - 1, 10))
      .toISOString()
      .split("T")[0],
  });

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  function handleFilter(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (selectedStatus !== "ALL") params.set("status", selectedStatus);
    if (selectedMonth !== "ALL") params.set("month", selectedMonth);
    if (selectedYear) params.set("year", selectedYear);
    params.set("page", "1");
    router.push(`/admin/bills?${params.toString()}`);
  }

  function handlePageChange(newPage: number) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", newPage.toString());
    router.push(`/admin/bills?${params.toString()}`);
  }

  async function handleGenerateBills(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await generateMonthlyBillsAction({
        billingMonth: parseInt(genForm.billingMonth, 10),
        billingYear: parseInt(genForm.billingYear, 10),
        dueDay: parseInt(genForm.dueDay, 10),
      });

      if (!res.success) {
        setFeedback({ type: "error", message: res.message });
        setIsLoading(false);
        return;
      }

      setFeedback({ type: "success", message: res.message });
      setTimeout(() => {
        setIsGenerateOpen(false);
        setFeedback(null);
        router.refresh();
      }, 1500);
    } catch (err) {
      setFeedback({ type: "error", message: "Failed to generate monthly bills." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateSingleBill(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setFeedback(null);

    try {
      const res = await createBillAction({
        customerId: singleForm.customerId,
        billingMonth: parseInt(singleForm.billingMonth, 10),
        billingYear: parseInt(singleForm.billingYear, 10),
        amount: parseFloat(singleForm.amount),
        dueDate: singleForm.dueDate,
      });

      if (!res.success) {
        setFeedback({ type: "error", message: res.message });
        setIsLoading(false);
        return;
      }

      setIsCreateSingleOpen(false);
      setFeedback(null);
      router.refresh();
    } catch (err) {
      setFeedback({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSyncOverdue() {
    setIsLoading(true);
    try {
      const res = await syncOverdueBillsAction();
      alert(res.message);
      router.refresh();
    } catch (err) {
      alert("Failed to sync overdue bills.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons & Quick Sync */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="primary"
            onClick={() => {
              setFeedback(null);
              setIsGenerateOpen(true);
            }}
          >
            <Receipt className="h-4 w-4 mr-1.5" />
            Generate Monthly Bills
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              setFeedback(null);
              setIsCreateSingleOpen(true);
            }}
          >
            <PlusCircle className="h-4 w-4 mr-1.5" />
            Create Single Bill
          </Button>

          <Button
            variant="ghost"
            onClick={handleSyncOverdue}
            disabled={isLoading}
            title="Scan and mark past due bills as OVERDUE"
            className="text-xs text-slate-600"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1 text-slate-500" />
            Sync Overdue
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleFilter} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search ID, name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500"
            >
              <option value="ALL">All Bill Statuses</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PAYMENT_SUBMITTED">Payment Submitted</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500"
            >
              <option value="ALL">All Months</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={(idx + 1).toString()}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-700 focus:border-blue-500"
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </select>

            <Button type="submit" variant="secondary" size="md">
              Apply Filter
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/75 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">Bill Period</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No bills found matching your filter.
                    </td>
                  </tr>
                ) : (
                  bills.map((bill) => (
                    <tr key={bill.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{bill.customerName}</div>
                        <div className="text-xs font-mono font-bold text-blue-600">
                          {bill.customerCode}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{bill.phone}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-900">
                        {formatMonthYear(bill.billingMonth, bill.billingYear)}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(bill.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">{formatDate(bill.dueDate)}</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={bill.status} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {bill.paidAt ? formatDate(bill.paidAt) : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm">
              <span className="text-xs text-slate-500">
                Page {currentPage} of {totalPages} ({totalCount} bills)
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

      {/* Generate Monthly Bills Modal */}
      <Modal
        isOpen={isGenerateOpen}
        onClose={() => !isLoading && setIsGenerateOpen(false)}
        title="Generate Monthly Invoices"
        description="Creates monthly bills for all active subscribers for the chosen cycle. Will not duplicate already existing bills."
      >
        <form onSubmit={handleGenerateBills} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Billing Month"
              value={genForm.billingMonth}
              onChange={(e) => setGenForm({ ...genForm, billingMonth: e.target.value })}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={(idx + 1).toString()}>
                  {m}
                </option>
              ))}
            </Select>

            <Select
              label="Billing Year"
              value={genForm.billingYear}
              onChange={(e) => setGenForm({ ...genForm, billingYear: e.target.value })}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </Select>
          </div>

          <Input
            label="Due Day of Month"
            type="number"
            min="1"
            max="28"
            value={genForm.dueDay}
            onChange={(e) => setGenForm({ ...genForm, dueDay: e.target.value })}
            helperText="Bills will be due on this date (e.g. 10th of the month)"
            required
          />

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                feedback.type === "error"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsGenerateOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Run Batch Generation
            </Button>
          </div>
        </form>
      </Modal>

      {/* Create Single Bill Modal */}
      <Modal
        isOpen={isCreateSingleOpen}
        onClose={() => !isLoading && setIsCreateSingleOpen(false)}
        title="Create Single Custom Bill"
        description="Issue a specific bill to an individual subscriber."
      >
        <form onSubmit={handleCreateSingleBill} className="space-y-4">
          <Select
            label="Select Customer"
            value={singleForm.customerId}
            onChange={(e) => {
              const custId = e.target.value;
              const found = customers.find((c) => c.id === custId);
              setSingleForm({
                ...singleForm,
                customerId: custId,
                amount: found ? found.monthlyBill.toString() : "800",
              });
            }}
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.customerCode} - {c.name} (৳{c.monthlyBill})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Month"
              value={singleForm.billingMonth}
              onChange={(e) => setSingleForm({ ...singleForm, billingMonth: e.target.value })}
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={(idx + 1).toString()}>
                  {m}
                </option>
              ))}
            </Select>

            <Select
              label="Year"
              value={singleForm.billingYear}
              onChange={(e) => setSingleForm({ ...singleForm, billingYear: e.target.value })}
            >
              <option value="2025">2025</option>
              <option value="2026">2026</option>
              <option value="2027">2027</option>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount (৳)"
              type="number"
              min="1"
              value={singleForm.amount}
              onChange={(e) => setSingleForm({ ...singleForm, amount: e.target.value })}
              required
            />

            <Input
              label="Due Date"
              type="date"
              value={singleForm.dueDate}
              onChange={(e) => setSingleForm({ ...singleForm, dueDate: e.target.value })}
              required
            />
          </div>

          {feedback && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium ${
                feedback.type === "error"
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200"
              }`}
            >
              {feedback.message}
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCreateSingleOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create Bill
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

