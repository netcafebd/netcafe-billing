import React from "react";
import { prisma } from "@/lib/db/prisma";
import { requireAdmin } from "@/lib/auth/session";
import { AdminHeader } from "@/components/admin/header";
import { ConnectionRequestsTable } from "./connection-requests-table";

export const dynamic = "force-dynamic";

export default async function ConnectionRequestsPage() {
  await requireAdmin();

  const requests = await prisma.connectionRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Connection Applications"
        description="View and manage new broadband connection inquiries submitted from website."
      />
      <ConnectionRequestsTable requests={requests} />
    </div>
  );
}

