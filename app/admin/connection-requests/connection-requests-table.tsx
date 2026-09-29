"use client";

import React, { useState } from "react";
import { updateConnectionRequestStatusAction, deleteConnectionRequestAction } from "@/app/actions/inquiries.actions";

interface ConnectionRequest {
  id: string;
  referenceCode: string;
  name: string;
  phone: string;
  packageName: string | null;
  area: string | null;
  address: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
}

interface Props {
  requests: ConnectionRequest[];
}

export function ConnectionRequestsTable({ requests }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    await updateConnectionRequestStatusAction(id, newStatus);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this connection request?")) return;
    setLoadingId(id);
    await deleteConnectionRequestAction(id);
    setLoadingId(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            🔌 New Connection Applications ({requests.length})
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Review and manage customer broadband connection requests
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-4 px-6">Reference Code</th>
              <th className="py-4 px-6">Applicant Name</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6">Package</th>
              <th className="py-4 px-6">Area & Address</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                  No connection applications found.
                </td>
              </tr>
            ) : (
              requests.map((req) => (
                <tr key={req.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6 font-mono font-semibold text-orange-400">
                    {req.referenceCode}
                  </td>
                  <td className="py-4 px-6 font-medium text-white">{req.name}</td>
                  <td className="py-4 px-6 font-mono text-cyan-400">
                    <a href={`tel:${req.phone}`} className="hover:underline">
                      {req.phone}
                    </a>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full text-xs border border-slate-700 font-medium">
                      {req.packageName || "N/A"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 max-w-xs">
                    <div className="font-semibold text-slate-300">{req.area || "N/A"}</div>
                    <div className="truncate" title={req.address || ""}>
                      {req.address || "No address provided"}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString("en-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      disabled={loadingId === req.id}
                      value={req.status}
                      onChange={(e) => handleStatusChange(req.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                        req.status === "PENDING"
                          ? "text-amber-400 border-amber-500/40 bg-amber-950/30"
                          : req.status === "CONTACTED"
                          ? "text-cyan-400 border-cyan-500/40 bg-cyan-950/30"
                          : req.status === "INSTALLED"
                          ? "text-emerald-400 border-emerald-500/40 bg-emerald-950/30"
                          : "text-rose-400 border-rose-500/40 bg-rose-950/30"
                      }`}
                    >
                      <option value="PENDING">🕒 Pending</option>
                      <option value="CONTACTED">📞 Contacted</option>
                      <option value="INSTALLED">✅ Installed</option>
                      <option value="CANCELLED">❌ Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(req.id)}
                      disabled={loadingId === req.id}
                      className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 px-2.5 py-1.5 rounded-lg border border-rose-900/40 transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

