const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function optimizeQr() {
  const inputPath = path.join(__dirname, "..", "public", "images", "bkash-qr.png");
  if (!fs.existsSync(inputPath)) {
    console.error("Input file not found:", inputPath);
    process.exit(1);
  }

  const buf = await sharp(inputPath)
    .resize({ width: 600 })
    .png({ quality: 85, compressionLevel: 9 })
    .toBuffer();

  // 1. Overwrite public/images/bkash-qr.png
  fs.writeFileSync(inputPath, buf);
  console.log("✔ Optimized public/images/bkash-qr.png saved. Size:", (buf.length / 1024).toFixed(1), "KB");

  // 2. Write to lib/constants/qr.ts
  const base64 = "data:image/png;base64," + buf.toString("base64");
  const qrTsContent = `export const DEFAULT_BKASH_QR_IMAGE = ${JSON.stringify(base64)};\n`;
  const qrTsPath = path.join(__dirname, "..", "lib", "constants", "qr.ts");
  fs.writeFileSync(qrTsPath, qrTsContent, "utf8");
  console.log("✔ Updated lib/constants/qr.ts with new base64 image!");

  // 3. Copy to standalone if it exists
  const standaloneImagesDir = path.join(__dirname, "..", ".next", "standalone", "public", "images");
  fs.mkdirSync(standaloneImagesDir, { recursive: true });
  fs.writeFileSync(path.join(standaloneImagesDir, "bkash-qr.png"), buf);
  console.log("✔ Copied to .next/standalone/public/images/bkash-qr.png");
}

optimizeQr().catch((err) => {
  console.error("Error optimizing QR:", err);
  process.exit(1);
});

