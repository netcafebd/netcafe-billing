import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const result: any = {
    status: "ok",
    time: new Date().toISOString(),
    cwd: process.cwd(),
    platform: process.platform,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL_SET: !!process.env.DATABASE_URL,
      AUTH_SECRET_SET: !!process.env.AUTH_SECRET,
      PRISMA_ENGINE: process.env.PRISMA_QUERY_ENGINE_LIBRARY || "default",
    },
    tables: {},
    system: null,
    logs: {},
  };

  try {
    const { getSystemProcessInfo } = await import("@/lib/services/system.service");
    result.system = getSystemProcessInfo(false);
  } catch (err: any) {
    result.system = { error: err?.message };
  }

  try {
    const { prisma } = await import("@/lib/db/prisma");

    const tests = [
      { name: "isp_settings", fn: () => prisma.iSPSettings.findFirst() },
      { name: "users", fn: () => prisma.user.count() },
      { name: "customers", fn: () => prisma.customer.count() },
      { name: "bills", fn: () => prisma.bill.count() },
      { name: "payments", fn: () => prisma.payment.count() },
      { name: "audit_logs", fn: () => prisma.auditLog.count() },
    ];

    for (const test of tests) {
      try {
        const res = await test.fn();
        result.tables[test.name] = { ok: true, result: res };
      } catch (err: any) {
        result.tables[test.name] = {
          ok: false,
          message: err?.message,
          code: err?.code,
          meta: err?.meta,
        };
      }
    }
  } catch (err: any) {
    result.prismaImportError = err?.message;
  }

  const logFiles = ["debug.log", "passenger.log", "stderr.log"];
  for (const lFile of logFiles) {
    const lPath = path.join(process.cwd(), lFile);
    if (fs.existsSync(lPath)) {
      try {
        const lines = fs.readFileSync(lPath, "utf8").split("\n").filter(Boolean);
        result.logs[lFile] = lines.slice(-25).join("\n");
      } catch (e: any) {
        result.logs[lFile] = `Error reading: ${e.message}`;
      }
    }
  }

  return NextResponse.json(result, { status: 200 });
}
