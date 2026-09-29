import type { PrismaClient as PrismaClientType } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

process.env.TOKIO_WORKER_THREADS = process.env.TOKIO_WORKER_THREADS || "1";
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || "1";

// 1. Locate Linux engine binary
if (process.platform === "linux") {
  const engineNames = [
    "libquery_engine-rhel-openssl-3.0.x.so.node",
    "libquery_engine-debian-openssl-3.0.x.so.node",
  ];

  const candidateDirs = [
    path.join(process.cwd(), "prisma"),
    path.join(process.cwd(), "prisma", "client"),
    path.join(process.cwd(), "node_modules", ".prisma", "client"),
    path.join(process.cwd(), "node_modules", "@prisma", "client"),
  ];

  for (const cDir of candidateDirs) {
    for (const eName of engineNames) {
      const full = path.join(cDir, eName);
      if (fs.existsSync(full)) {
        process.env.PRISMA_QUERY_ENGINE_LIBRARY = full;
        break;
      }
    }
    if (process.env.PRISMA_QUERY_ENGINE_LIBRARY) break;
  }
}

// 2. Locate and load PrismaClient constructor
function getPrismaClientClass(): any {
  // Option A: Try direct require from prisma/client (transferred by FTP)
  const candidateClientDirs = [
    path.join(process.cwd(), "prisma", "client"),
    path.join(process.cwd(), "node_modules", ".prisma", "client"),
  ];

  for (const cDir of candidateClientDirs) {
    if (fs.existsSync(path.join(cDir, "index.js"))) {
      try {
        const mod = require(cDir);
        if (mod && mod.PrismaClient) {
          return mod.PrismaClient;
        }
      } catch (err: any) {
        console.warn("[Prisma] Failed loading from " + cDir + ":", err?.message);
      }
    }
  }

  // Option B: Standard require('@prisma/client')
  try {
    const mod = require("@prisma/client");
    if (mod && mod.PrismaClient) {
      return mod.PrismaClient;
    }
  } catch (err: any) {
    console.warn("[Prisma] Failed loading from @prisma/client:", err?.message);
  }

  return null;
}

function initPrisma(): PrismaClientType {
  const ClientClass = getPrismaClientClass();

  if (ClientClass) {
    try {
      return new ClientClass({
        log: ["error"],
      });
    } catch (err: any) {
      console.error("[Prisma] Constructor failed:", err?.message);
    }
  }

  // Fallback proxy to prevent top-level SSR crash
  return new Proxy({} as PrismaClientType, {
    get(_, prop) {
      if (typeof prop === "string" && !prop.startsWith("$")) {
        return new Proxy({}, {
          get() {
            return async () => {
              throw new Error("Database client not available on server.");
            };
          },
        });
      }
      return async () => {
        throw new Error("Database client not available on server.");
      };
    },
  });
}

export const prisma = globalForPrisma.prisma ?? initPrisma();
globalForPrisma.prisma = prisma;
