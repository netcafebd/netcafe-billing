import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { MessagesTable } from "./messages-table";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requireAdmin();

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Contact Messages & Queries"
        description="View and respond to helpdesk messages and website inquiries."
      />
      <MessagesTable messages={messages} />
    </div>
  );
}

