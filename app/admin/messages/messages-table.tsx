"use client";

import React, { useState } from "react";
import { updateContactMessageStatusAction, deleteContactMessageAction } from "@/app/actions/inquiries.actions";

interface ContactMessage {
  id: string;
  name: string;
  phone: string;
  subject: string | null;
  message: string;
  status: string;
  createdAt: Date;
}

interface Props {
  messages: ContactMessage[];
}

export function MessagesTable({ messages }: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setLoadingId(id);
    await updateContactMessageStatusAction(id, newStatus);
    setLoadingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    setLoadingId(id);
    await deleteContactMessageAction(id);
    setLoadingId(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-6 border-b border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            💬 Helpdesk & Contact Messages ({messages.length})
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Customer inquiries and support messages submitted from contact section
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-950/60 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-4 px-6">Sender Name</th>
              <th className="py-4 px-6">Phone Number</th>
              <th className="py-4 px-6">Subject</th>
              <th className="py-4 px-6">Message Content</th>
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {messages.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                  No contact messages received yet.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-4 px-6 font-medium text-white">{msg.name}</td>
                  <td className="py-4 px-6 font-mono text-cyan-400">
                    <a href={`tel:${msg.phone}`} className="hover:underline">
                      {msg.phone}
                    </a>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full text-xs border border-slate-700 font-medium">
                      {msg.subject || "General Query"}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-300 max-w-sm">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </div>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString("en-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="py-4 px-6">
                    <select
                      disabled={loadingId === msg.id}
                      value={msg.status}
                      onChange={(e) => handleStatusChange(msg.id, e.target.value)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-lg border bg-slate-950 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                        msg.status === "UNREAD"
                          ? "text-amber-400 border-amber-500/40 bg-amber-950/30"
                          : msg.status === "READ"
                          ? "text-cyan-400 border-cyan-500/40 bg-cyan-950/30"
                          : "text-emerald-400 border-emerald-500/40 bg-emerald-950/30"
                      }`}
                    >
                      <option value="UNREAD">🔴 Unread</option>
                      <option value="READ">📖 Read</option>
                      <option value="RESOLVED">✅ Resolved</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDelete(msg.id)}
                      disabled={loadingId === msg.id}
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

