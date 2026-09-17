"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import { updateCustomerAction } from "@/app/actions/customer.actions";
import { Edit2 } from "lucide-react";
import { CustomerStatus } from "@prisma/client";

interface EditCustomerModalProps {
  customer: {
    id: string;
    customerCode: string;
    name: string;
    phone: string;
    email: string | null;
    address: string;
    monthlyBill: number;
    status: CustomerStatus;
  };
}

export function EditCustomerModal({ customer }: EditCustomerModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: customer.name,
    phone: customer.phone,
    email: customer.email || "",
    address: customer.address,
    monthlyBill: customer.monthlyBill.toString(),
    status: customer.status,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await updateCustomerAction(customer.id, {
        ...form,
        monthlyBill: parseFloat(form.monthlyBill),
      });

      if (!res.success) {
        setError(res.message || "Failed to update customer");
        setIsLoading(false);
        return;
      }

      setIsOpen(false);
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Edit2 className="h-4 w-4 mr-1.5" />
        Edit Profile
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !isLoading && setIsOpen(false)}
        title={`Edit ${customer.customerCode}`}
        description="Update subscriber personal details and monthly rate."
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Phone Number"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <Input
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <Input
            label="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Monthly Bill Amount (৳)"
              type="number"
              min="1"
              value={form.monthlyBill}
              onChange={(e) => setForm({ ...form, monthlyBill: e.target.value })}
              required
            />
            <Select
              label="Account Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as CustomerStatus })}
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </Select>
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium bg-rose-50 p-2.5 rounded-lg border border-rose-200">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

