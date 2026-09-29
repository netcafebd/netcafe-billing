const fs   = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const root   = path.resolve(__dirname, "..");
const tmp    = path.join(root, "_deploy_tmp");
const zipOut = "C:\\Users\\NIPUN ROY\\Desktop\\netcafe-deploy.zip";

// ── helpers ────────────────────────────────────────────────────────────────
function copyDir(src, dst) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dst, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dst, entry.name);
    entry.isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
}

// ── cleanup ────────────────────────────────────────────────────────────────
if (fs.existsSync(tmp))    fs.rmSync(tmp, { recursive: true, force: true });
if (fs.existsSync(zipOut)) fs.rmSync(zipOut, { force: true });

fs.mkdirSync(tmp, { recursive: true });
console.log("Staging files...");

// ── copy files needed to run on cPanel ────────────────────────────────────
for (const f of ["server.js", "package.json", "package-lock.json", ".env.example"]) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(tmp, f));
}
copyDir(path.join(root, ".next",  "standalone"), path.join(tmp, ".next", "standalone"));
copyDir(path.join(root, "prisma"),               path.join(tmp, "prisma"));

console.log("Staging done. Zipping...");

// ── zip with PowerShell ────────────────────────────────────────────────────
execSync(
  `powershell -NoProfile -Command "Compress-Archive -Path '${tmp}\\*' -DestinationPath '${zipOut}' -Force"`,
  { stdio: "inherit" }
);

// ── cleanup tmp ────────────────────────────────────────────────────────────
fs.rmSync(tmp, { recursive: true, force: true });

const sizeMB = (fs.statSync(zipOut).size / 1024 / 1024).toFixed(1);
console.log(`\n✔ Done! netcafe-deploy.zip (${sizeMB} MB) saved to Desktop.`);

