import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const doRestart = searchParams.get("restart") === "1" || searchParams.get("restart") === "true";

  if (doRestart) {
    setTimeout(() => {
      process.exit(0);
    }, 200);
  }

  const cwd = process.cwd();
  let rootFiles: string[] = [];
  let prismaFiles: string[] = [];
  let nodeModulesPrismaFiles: string[] = [];

  try {
    rootFiles = fs.readdirSync(cwd);
  } catch (e: any) {
    rootFiles = [e.message];
  }

  const prismaDir = path.join(cwd, "prisma");
  try {
    if (fs.existsSync(prismaDir)) {
      prismaFiles = fs.readdirSync(prismaDir);
    } else {
      prismaFiles = ["NOT_FOUND: " + prismaDir];
    }
  } catch (e: any) {
    prismaFiles = [e.message];
  }

  const nmPrisma = path.join(cwd, "node_modules", ".prisma", "client");
  try {
    if (fs.existsSync(nmPrisma)) {
      nodeModulesPrismaFiles = fs.readdirSync(nmPrisma);
    } else {
      nodeModulesPrismaFiles = ["NOT_FOUND: " + nmPrisma];
    }
  } catch (e: any) {
    nodeModulesPrismaFiles = [e.message];
  }

  let dbCheck: any = null;
  try {
    const { prisma } = await import("@/lib/db/prisma");
    const [customerCount, settings] = await Promise.all([
      prisma.customer.count(),
      prisma.iSPSettings.findFirst({ select: { ispName: true, hotline: true, officeAddress: true } }),
    ]);
    dbCheck = {
      status: "connected",
      customerCount,
      settingsFound: !!settings,
      ispName: settings?.ispName,
      officeAddressLength: settings?.officeAddress?.length || 0,
    };
  } catch (err: any) {
    dbCheck = { status: "error", message: err?.message, stack: err?.stack };
  }

  return NextResponse.json({
    status: "ok",
    cwd,
    platform: process.platform,
    envDatabaseUrl: !!process.env.DATABASE_URL,
    prismaQueryEngineEnv: process.env.PRISMA_QUERY_ENGINE_LIBRARY || "none",
    restarting: doRestart,
    dbCheck,
    rootFiles,
    prismaFiles,
    nodeModulesPrismaFiles,
  });
}
