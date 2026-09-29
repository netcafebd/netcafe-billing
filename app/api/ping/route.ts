import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cwd = process.cwd();
  const doSync = searchParams.get("sync") === "1" || searchParams.get("sync") === "true";
  const doRestart = searchParams.get("restart") === "1" || searchParams.get("restart") === "true";

  const syncLogs: string[] = [];

  if (doSync) {
    const copyDir = (srcDir: string, destDir: string) => {
      if (!fs.existsSync(srcDir)) {
        syncLogs.push(`Source does not exist: ${srcDir}`);
        return;
      }
      try {
        fs.mkdirSync(destDir, { recursive: true });
        for (const f of fs.readdirSync(srcDir)) {
          const s = path.join(srcDir, f);
          const d = path.join(destDir, f);
          if (fs.statSync(s).isFile()) {
            fs.copyFileSync(s, d);
            syncLogs.push(`Copied ${f} -> ${destDir}`);
          }
        }
      } catch (err: any) {
        syncLogs.push(`Error copying ${srcDir} -> ${destDir}: ${err.message}`);
      }
    };

    const genClient = path.join(cwd, "prisma", "client");
    const genAtClient = path.join(cwd, "prisma", "at-client");

    const dotPrismaTargets = [
      path.join(cwd, "node_modules", ".prisma", "client"),
      "/home2/netcafeb/nodevenv/netcafe-billing/20/lib/node_modules/.prisma/client",
    ];

    const atPrismaTargets = [
      path.join(cwd, "node_modules", "@prisma", "client"),
      "/home2/netcafeb/nodevenv/netcafe-billing/20/lib/node_modules/@prisma/client",
    ];

    for (const target of dotPrismaTargets) {
      copyDir(genClient, target);
    }

    for (const target of atPrismaTargets) {
      copyDir(genAtClient, target);
    }
  }

  if (doRestart) {
    setTimeout(() => {
      process.exit(0);
    }, 500);
  }

  let rootFiles: string[] = [];
  let prismaFiles: string[] = [];
  let nodeModulesPrismaFiles: string[] = [];
  let nodevenvPrismaFiles: string[] = [];

  try {
    rootFiles = fs.readdirSync(cwd);
  } catch (e: any) {
    rootFiles = [e.message];
  }

  const prismaDir = path.join(cwd, "prisma");
  try {
    if (fs.existsSync(prismaDir)) {
      prismaFiles = fs.readdirSync(prismaDir);
    }
  } catch (e: any) {
    prismaFiles = [e.message];
  }

  const nmPrisma = path.join(cwd, "node_modules", ".prisma", "client");
  try {
    if (fs.existsSync(nmPrisma)) {
      nodeModulesPrismaFiles = fs.readdirSync(nmPrisma);
    }
  } catch (e: any) {
    nodeModulesPrismaFiles = [e.message];
  }

  const nodevenvDir = "/home2/netcafeb/nodevenv/netcafe-billing/20/lib/node_modules/.prisma/client";
  try {
    if (fs.existsSync(nodevenvDir)) {
      nodevenvPrismaFiles = fs.readdirSync(nodevenvDir);
    }
  } catch (e: any) {
    nodevenvPrismaFiles = [e.message];
  }

  return NextResponse.json({
    status: "ok",
    cwd,
    platform: process.platform,
    envDatabaseUrl: !!process.env.DATABASE_URL,
    prismaQueryEngineEnv: process.env.PRISMA_QUERY_ENGINE_LIBRARY || "none",
    pid: process.pid,
    syncLogs,
    restarting: doRestart,
    rootFiles,
    prismaFiles,
    nodeModulesPrismaFiles,
    nodevenvPrismaFiles,
  });
}
