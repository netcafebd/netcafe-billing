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

  console.log("✔ Standalone bundle is ready for cPanel Passenger deployment!");
} else {
  console.log("ℹ Standalone directory not found (skipping postbuild copy).");
}

