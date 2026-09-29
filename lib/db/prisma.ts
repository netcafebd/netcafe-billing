import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

process.env.TOKIO_WORKER_THREADS = process.env.TOKIO_WORKER_THREADS || "1";
process.env.UV_THREADPOOL_SIZE = process.env.UV_THREADPOOL_SIZE || "1";

// Auto-detect Linux Prisma query engine binary in standalone directory
if (process.platform === "linux" && !process.env.PRISMA_QUERY_ENGINE_LIBRARY) {
  const possiblePaths = [
    path.join(process.cwd(), "prisma", "libquery_engine-rhel-openssl-3.0.x.so.node"),
    path.join(process.cwd(), "prisma", "libquery_engine-debian-openssl-3.0.x.so.node"),
    path.join(process.cwd(), "node_modules", ".prisma", "client", "libquery_engine-rhel-openssl-3.0.x.so.node"),
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = p;
      break;
    }
  }
}

// Enforce strict singleton pattern across all environments to prevent thread exhaustion on shared hosting
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

globalForPrisma.prisma = prisma;

