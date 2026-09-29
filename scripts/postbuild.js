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
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (e) {
        // ignore locked files
      }
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
  const engineSourceDirs = [
    path.join(rootDir, "node_modules", "prisma"),
    path.join(rootDir, "node_modules", "@prisma", "engines"),
    path.join(rootDir, "node_modules", ".prisma", "client"),
  ];

  const targetDirs = [
    path.join(standaloneDir, "node_modules", ".prisma", "client"),
    path.join(standaloneDir, "node_modules", "@prisma", "client"),
    path.join(standaloneDir, "prisma"),
  ];

  for (const tDir of targetDirs) {
    fs.mkdirSync(tDir, { recursive: true });
    for (const eFile of engineFiles) {
      for (const sDir of engineSourceDirs) {
        const srcFile = path.join(sDir, eFile);
        if (fs.existsSync(srcFile)) {
          fs.copyFileSync(srcFile, path.join(tDir, eFile));
          console.log(`✔ Copied ${eFile} -> ${path.relative(rootDir, tDir)}`);
          break;
        }
      }
    }
  }

  // 4b. Copy generated Prisma Client into .next/standalone/prisma/client
  // because FTP excludes node_modules/**, this ensures the generated client is transferred!
  const dotPrismaSrc = path.join(rootDir, "node_modules", ".prisma", "client");
  const dotPrismaDest = path.join(standaloneDir, "prisma", "client");
  if (fs.existsSync(dotPrismaSrc)) {
    copyDirRecursive(dotPrismaSrc, dotPrismaDest);
    console.log("✔ Copied node_modules/.prisma/client -> .next/standalone/prisma/client");
  }

  const atPrismaSrc = path.join(rootDir, "node_modules", "@prisma", "client");
  const atPrismaDest = path.join(standaloneDir, "prisma", "at-client");
  if (fs.existsSync(atPrismaSrc)) {
    copyDirRecursive(atPrismaSrc, atPrismaDest);
    console.log("✔ Copied node_modules/@prisma/client -> .next/standalone/prisma/at-client");
  }

  // 5. Copy standalone node_modules to root node_modules so root require("next") works natively
  const standaloneNodeModules = path.join(standaloneDir, "node_modules");
  const rootNodeModules = path.join(rootDir, "node_modules");
  if (fs.existsSync(standaloneNodeModules)) {
    console.log("--> Syncing standalone node_modules to root node_modules...");
    copyDirRecursive(standaloneNodeModules, rootNodeModules);
    console.log("✔ Synced standalone node_modules -> root node_modules");
  }

  // 6. Inject thread limits & module resolution into standalone server.js
  const standaloneServerJs = path.join(standaloneDir, "server.js");
  if (fs.existsSync(standaloneServerJs)) {
    let content = fs.readFileSync(standaloneServerJs, "utf8");
    const threadLimitCode = `// Injected thread pool constraints & module path resolver for CloudLinux shared hosting
process.env.UV_THREADPOOL_SIZE = "1";
process.env.TOKIO_WORKER_THREADS = "1";
process.env.RAYON_NUM_THREADS = "1";

const _fs = require("fs");
const _path = require("path");

if (!module.paths.includes(_path.join(__dirname, "node_modules"))) {
  module.paths.unshift(_path.join(__dirname, "node_modules"));
}

// Auto-sync uploaded prisma/client -> node_modules/.prisma/client on server boot
try {
  const _genPrisma = _path.join(__dirname, "prisma", "client");
  const _targetDotPrisma = _path.join(__dirname, "node_modules", ".prisma", "client");
  if (_fs.existsSync(_genPrisma)) {
    _fs.mkdirSync(_targetDotPrisma, { recursive: true });
    for (const f of _fs.readdirSync(_genPrisma)) {
      const src = _path.join(_genPrisma, f);
      if (_fs.statSync(src).isFile()) {
        _fs.copyFileSync(src, _path.join(_targetDotPrisma, f));
      }
    }
  }
} catch (e) {}

try {
  const _genAtPrisma = _path.join(__dirname, "prisma", "at-client");
  const _targetAtPrisma = _path.join(__dirname, "node_modules", "@prisma", "client");
  if (_fs.existsSync(_genAtPrisma)) {
    _fs.mkdirSync(_targetAtPrisma, { recursive: true });
    for (const f of _fs.readdirSync(_genAtPrisma)) {
      const src = _path.join(_genAtPrisma, f);
      if (_fs.statSync(src).isFile()) {
        _fs.copyFileSync(src, _path.join(_targetAtPrisma, f));
      }
    }
  }
} catch (e) {}

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
    console.log("✔ Injected safe thread constraints, Prisma client sync, and module resolver into .next/standalone/server.js");
  }

  console.log("✔ Standalone bundle is ready for cPanel Passenger deployment!");
} else {
  console.log("ℹ Standalone directory not found (skipping postbuild copy).");
}
