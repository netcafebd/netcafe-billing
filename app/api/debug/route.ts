import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: any = {
    status: "ok",
    time: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
    },
    tables: {},
    debugLog: null,
  };

  // Test individual tables to find exact failure
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

  const logPath = path.join(process.cwd(), "debug.log");
  if (fs.existsSync(logPath)) {
    try {
      const lines = fs.readFileSync(logPath, "utf8").split("\n").filter(Boolean);
      result.debugLog = lines.slice(-20).join("\n");
    } catch {}
  }

  return NextResponse.json(result, { status: 200 });
}

