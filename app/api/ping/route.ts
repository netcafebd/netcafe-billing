import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
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

  return NextResponse.json({
    status: "ok",
    cwd,
    platform: process.platform,
    envDatabaseUrl: !!process.env.DATABASE_URL,
    prismaQueryEngineEnv: process.env.PRISMA_QUERY_ENGINE_LIBRARY || "none",
    rootFiles,
    prismaFiles,
    nodeModulesPrismaFiles,
  });
}
