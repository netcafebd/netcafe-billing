import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

process.env.TOKIO_WORKER_THREADS = process.env.TOKIO_WORKER_THREADS || "1";
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || "1";

// Auto-detect Linux Prisma query engine binary in all possible directories
if (process.platform === "linux") {
  const engineNames = [
    "libquery_engine-rhel-openssl-3.0.x.so.node",
    "libquery_engine-debian-openssl-3.0.x.so.node",
    "libquery_engine-rhel-openssl-1.1.x.so.node",
  ];

  const candidateDirs = [
    path.join(process.cwd(), "prisma"),
    path.join(process.cwd(), "node_modules", ".prisma", "client"),
    path.join(process.cwd(), "node_modules", "@prisma", "client"),
    path.join(__dirname, "prisma"),
    path.join(__dirname, "..", "..", "prisma"),
    path.join(__dirname, "..", "prisma"),
  ];

  let foundEngine: string | null = null;
  for (const cDir of candidateDirs) {
    for (const eName of engineNames) {
      const candidate = path.join(cDir, eName);
      if (fs.existsSync(candidate)) {
        foundEngine = candidate;
        break;
      }
    }
    if (foundEngine) break;
  }

  if (foundEngine) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = foundEngine;

    // Ensure it also exists in node_modules/.prisma/client if that directory exists
    const nmClientDir = path.join(process.cwd(), "node_modules", ".prisma", "client");
    if (fs.existsSync(nmClientDir)) {
      const targetInNm = path.join(nmClientDir, path.basename(foundEngine));
      if (!fs.existsSync(targetInNm)) {
        try {
          fs.copyFileSync(foundEngine, targetInNm);
        } catch (_) {}
      }
    }
  }
}

function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient({
      log: ["error"],
    });
  } catch (err: any) {
    console.error("[CRITICAL] PrismaClient initialization error:", err);
    return new Proxy({} as PrismaClient, {
      get(_, prop) {
        if (typeof prop === "string" && !prop.startsWith("$")) {
          return new Proxy({}, {
            get() {
              return async () => {
                throw new Error(`PrismaClient failed to initialize: ${err?.message || "Unknown engine error"}`);
              };
            },
          });
        }
        return async () => {
          throw new Error(`PrismaClient failed to initialize: ${err?.message || "Unknown engine error"}`);
        };
      },
    });
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;
