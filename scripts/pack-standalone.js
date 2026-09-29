const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const rootDir = path.resolve(__dirname, "..");
const desktopZip = "C:\\Users\\NIPUN ROY\\Desktop\\netcafe-billing.zip";
const localZip = path.join(rootDir, "netcafe-billing.zip");

console.log("--> Packaging complete standalone deployment package for cPanel...");

// Create deployment zip via PowerShell with Force parameter
const psCommand = `powershell -Command "Remove-Item -Force -ErrorAction SilentlyContinue '${desktopZip}', '${localZip}'; Get-ChildItem -Path . -Force -Exclude @('.git', '*.zip') | Compress-Archive -DestinationPath '${desktopZip}' -Force; Copy-Item '${desktopZip}' -Destination '${localZip}' -Force"`;

try {
  execSync(psCommand, { cwd: rootDir, stdio: "inherit" });
  console.log("✔ Successfully created netcafe-billing.zip on Desktop!");
} catch (err) {
  console.error("Packaging error:", err);
}

