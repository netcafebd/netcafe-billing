// server.js - cPanel Phusion Passenger Startup File
"use strict";

const path = require("path");
const fs   = require("fs");

process.env.UV_THREADPOOL_SIZE   = "1";
process.env.TOKIO_WORKER_THREADS = "1";
process.env.RAYON_NUM_THREADS    = "1";
process.env.NODE_ENV             = process.env.NODE_ENV || "production";

const standaloneDir    = path.join(__dirname, ".next", "standalone");
const standaloneServer = path.join(standaloneDir, "server.js");

if (!fs.existsSync(standaloneServer)) {
  console.error("[FATAL] .next/standalone/server.js not found.");
  process.exit(1);
}

// ── Auto-patch CSS to fix Bangla line overlap in Hero title ──────────────────
try {
  const findCssFiles = (dir) => {
    let list = [];
    if (!fs.existsSync(dir)) return list;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) list = list.concat(findCssFiles(full));
      else if (item.name.endsWith(".css") && !item.name.includes("node_modules")) list.push(full);
    }
    return list;
  };

  const cssFiles = findCssFiles(path.join(__dirname, ".next"));
  const banglaCssFix = `
/* Auto-fix Bangla line overlap */
#hero h1 { line-height: 1 !important; letter-spacing: normal !important; }
#hero h1 span { display: block !important; margin-top: 10px !important; line-height: 1.45 !important; padding-bottom: 6px !important; }
`;

  for (const cssFile of cssFiles) {
    const content = fs.readFileSync(cssFile, "utf8");
    if (!content.includes("/* Auto-fix Bangla line overlap */")) {
      fs.appendFileSync(cssFile, banglaCssFix, "utf8");
      console.log("[INFO] Patched Bangla CSS fix into:", path.basename(cssFile));
    }
  }
} catch (e) {
  console.error("[WARN] CSS patch skipped:", e.message);
}

// ── Add standalone node_modules to resolution chain ──────────────────────────
const standaloneMods = path.join(standaloneDir, "node_modules");
if (fs.existsSync(standaloneMods)) {
  module.paths.unshift(standaloneMods);
}

// ── Change CWD so Next.js resolves assets relative to standalone dir ──────────
try { process.chdir(standaloneDir); } catch (_) {}

// ── Boot Next.js ──────────────────────────────────────────────────────────────
require(standaloneServer);
