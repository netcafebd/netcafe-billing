// server.js - Production startup file for cPanel Phusion Passenger
// Putul Host / CloudLinux Setup Node.js App compatible

const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

// Attempt automatic database migration and seeding on first startup (No-terminal required)
try {
  if (process.env.DATABASE_URL) {
    console.log("[Setup] Checking database migrations...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    console.log("[Setup] Prisma migrations successfully applied.");
  }
} catch (migErr) {
  console.warn("[Setup] Automatic migration notice:", migErr.message);
}

const standaloneServer = path.join(__dirname, ".next", "standalone", "server.js");

if (fs.existsSync(standaloneServer)) {
  // Delegate execution to Next.js standalone server
  require(standaloneServer);
} else {
  // Fallback standard Next.js production server
  const next = require("next");
  const http = require("http");

  const port = parseInt(process.env.PORT, 10) || 3000;
  const app = next({ dev: false, dir: __dirname });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(port, () => {
      console.log(`> ISP Billing System running on port ${port}`);
    });
  }).catch((err) => {
    console.error("Startup error:", err);
    process.exit(1);
  });
}
