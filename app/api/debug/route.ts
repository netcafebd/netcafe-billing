import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import fs from "fs";
import path from "path";

import { getSystemProcessInfo } from "@/lib/services/system.service";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: any = {
    status: "ok",
    time: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
      PRISMA_ENGINE: process.env.PRISMA_QUERY_ENGINE_LIBRARY || "default",
    },
    tables: {},
    debugLog: null,
  };

  try {
    result.system = getSystemProcessInfo(false);
  } catch (err: any) {
    result.system = { error: err?.message };
  }

  // Test individual tables
  const tests = [
    { name: "users", fn: () => prisma.user.count() },
    { name: "customers", fn: () => prisma.customer.count() },
    { name: "bills", fn: () => prisma.bill.count() },
    { name: "payments", fn: () => prisma.payment.count() },
    { name: "isp_settings", fn: () => prisma.iSPSettings.findFirst() },
    { name: "audit_logs", fn: () => prisma.auditLog.count() },
  ];

  for (const test of tests) {
    try {
      const res = await test.fn();
      result.tables[test.name] = { ok: true, result: res };
    } catch (err: any) {
      result.tables[test.name] = {
        ok: false,
        message: err.message,
        code: err.code,
        meta: err.meta,
      };
    }
  }

  const logFiles = ["debug.log", "passenger.log", "stderr.log"];
  for (const lFile of logFiles) {
    const lPath = path.join(process.cwd(), lFile);
    if (fs.existsSync(lPath)) {
      try {
        const lines = fs.readFileSync(lPath, "utf8").split("\n").filter(Boolean);
        result[lFile] = lines.slice(-25).join("\n");
      } catch {}
    }
  }

  return NextResponse.json(result, { status: 200 });
}

