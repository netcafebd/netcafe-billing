const fs = require("fs");
const path = require("path");

function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("--> Running postbuild: Preparing standalone deployment package...");

const rootDir = path.resolve(__dirname, "..");
const standaloneDir = path.join(rootDir, ".next", "standalone");

if (fs.existsSync(standaloneDir)) {
  // 1. Copy public directory
  const publicSrc = path.join(rootDir, "public");
  const publicDest = path.join(standaloneDir, "public");
  if (fs.existsSync(publicSrc)) {
    copyDirRecursive(publicSrc, publicDest);
    console.log("✔ Copied public/ -> .next/standalone/public");
  }

  // 2. Copy .next/static directory
  const staticSrc = path.join(rootDir, ".next", "static");
  const staticDest = path.join(standaloneDir, ".next", "static");
  if (fs.existsSync(staticSrc)) {
    copyDirRecursive(staticSrc, staticDest);
    console.log("✔ Copied .next/static -> .next/standalone/.next/static");
  }

  // 3. Copy prisma directory (for migrations and schema)
  const prismaSrc = path.join(rootDir, "prisma");
  const prismaDest = path.join(standaloneDir, "prisma");
  if (fs.existsSync(prismaSrc)) {
    copyDirRecursive(prismaSrc, prismaDest);
    console.log("✔ Copied prisma/ -> .next/standalone/prisma");
  }

  // 4. Copy Prisma client engines (including Linux binaries: debian-openssl-3.0.x, rhel-openssl-3.0.x)
  const engineFiles = [
    "libquery_engine-debian-openssl-3.0.x.so.node",
    "libquery_engine-rhel-openssl-3.0.x.so.node",
  ];
  const engineSourceDir = path.join(rootDir, "node_modules", "prisma");

  const targetDirs = [
    path.join(standaloneDir, "node_modules", ".prisma", "client"),
    path.join(standaloneDir, "node_modules", "@prisma", "client"),
    path.join(standaloneDir, "prisma"),
  ];

  for (const tDir of targetDirs) {
    fs.mkdirSync(tDir, { recursive: true });
    for (const eFile of engineFiles) {
      const srcFile = path.join(engineSourceDir, eFile);
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(tDir, eFile));
        console.log(`✔ Copied ${eFile} -> ${path.relative(rootDir, tDir)}`);
      }
    }
  }

  // 5. Inject thread limits, zombie process cleanup, & signal handlers into standalone server.js
  const standaloneServerJs = path.join(standaloneDir, "server.js");
  if (fs.existsSync(standaloneServerJs)) {
    let content = fs.readFileSync(standaloneServerJs, "utf8");
    const threadLimitCode = `// Injected thread pool constraints & LVE Guard for CloudLinux shared hosting
process.env.UV_THREADPOOL_SIZE = "1";
process.env.TOKIO_WORKER_THREADS = "1";
process.env.RAYON_NUM_THREADS = "1";

// Auto clean duplicate/zombie node processes from previous unkilled restarts
if (process.platform === "linux") {
  try {
    const _cp = require("child_process");
    const curPid = process.pid;
    const stdout = _cp.execSync("ps -u $(whoami) -o pid,comm --no-headers", { timeout: 2000, encoding: "utf8" });
    const lines = stdout.trim().split("\\n");
    for (const line of lines) {
      const parts = line.trim().split(/\\s+/);
      const pid = parseInt(parts[0], 10);
      const comm = parts.slice(1).join(" ");
      if (pid && pid !== curPid && (comm.includes("node") || comm.includes("next-server"))) {
        try {
          process.kill(pid, "SIGKILL");
          console.log("[LVE Guard] Cleaned up zombie process PID:", pid);
        } catch (_) {}
      }
    }
  } catch (_) {}
}

// Immediate clean exit on cPanel restart signals
process.on("SIGTERM", () => {
  console.log("[LVE Guard] Received SIGTERM, exiting cleanly...");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("[LVE Guard] Received SIGINT, exiting cleanly...");
  process.exit(0);
});

const _fs = require("fs");
const _path = require("path");
const _origErr = console.error;
console.error = function (...args) {
  try {
    const msg = "[" + new Date().toISOString() + "] " + args.map(a => (a && a.stack) ? a.stack : (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ") + "\\n";
    _fs.appendFileSync(_path.join(__dirname, "debug.log"), msg);
  } catch (e) {}
  _origErr.apply(console, args);
};
`;
    // Clean any prior injected block
    const cleanContent = content.replace(/\/\/ Injected thread pool constraints[\s\S]*?_origErr\.apply\(console, args\);\s*};\n?/g, "");
    fs.writeFileSync(standaloneServerJs, threadLimitCode + cleanContent, "utf8");
    console.log("✔ Injected thread constraints, zombie cleanup, and signal handlers into .next/standalone/server.js");
  }

  console.log("✔ Standalone bundle is ready for cPanel Passenger deployment!");
} else {
  console.log("ℹ Standalone directory not found (skipping postbuild copy).");
}
