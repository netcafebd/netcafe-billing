// server.js - Production startup file for cPanel Phusion Passenger
// Putul Host / CloudLinux Setup Node.js App compatible

const path = require("path");
const fs = require("fs");

process.env.NODE_ENV = process.env.NODE_ENV || "production";
process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = process.env.HOSTNAME || "0.0.0.0";

// --- Automatic Database Health Check on Startup ---
async function checkDatabaseOnStartup() {
  const statusFile = path.join(__dirname, "db-status.txt");
  const dbUrl = process.env.DATABASE_URL || "NOT_SET";
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");

  try {
    const { PrismaClient } = require("@prisma/client");
    const testPrisma = new PrismaClient();
    const result = await testPrisma.$queryRaw`SELECT NOW() as current_time, current_database() as db_name, current_user as db_user;`;
    const userCount = await testPrisma.user.count();
    await testPrisma.$disconnect();

    const msg = [
      `=== DATABASE CONNECTION: SUCCESSFUL ===`,
      `Time: ${new Date().toISOString()}`,
      `Database URL: ${maskedUrl}`,
      `Connected Database: ${result[0]?.db_name}`,
      `Connected User: ${result[0]?.db_user}`,
      `Users in Database: ${userCount}`,
      `Status: Database is online and ready!`,
    ].join("\n");

    fs.writeFileSync(statusFile, msg, "utf8");
    console.log(msg);
  } catch (err) {
    const errMsg = [
      `=== DATABASE CONNECTION: FAILED ===`,
      `Time: ${new Date().toISOString()}`,
      `Database URL: ${maskedUrl}`,
      `Error Code: ${err.code || "UNKNOWN"}`,
      `Error Message: ${err.message}`,
      `Troubleshooting: Check if host should be 127.0.0.200 or localhost, and verify DB password.`,
    ].join("\n");

    fs.writeFileSync(statusFile, errMsg, "utf8");
    console.error(errMsg);
  }
}

checkDatabaseOnStartup().catch(() => {});

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
