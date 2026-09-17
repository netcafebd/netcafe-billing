import { NextResponse } from "next/server";
import { killZombieProcesses, getSystemProcessInfo } from "@/lib/services/system.service";
import { requireAdmin } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = killZombieProcesses();
  const currentInfo = getSystemProcessInfo();

  return NextResponse.json({
    ok: true,
    killedPids: result.killedPids,
    error: result.error,
    system: currentInfo,
  });
}

