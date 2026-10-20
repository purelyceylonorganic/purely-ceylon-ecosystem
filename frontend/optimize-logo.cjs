
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

async function optimize() {
  const input = path.join("public", "logo", "pco-logo.png");
  const output = path.join("public", "logo", "pco-logo.webp");

  await sharp(input)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 100 })
    .toFile(output);

  const originalSize = fs.statSync(input).size;
  const optimizedSize = fs.statSync(output).size;

  console.log("Original:", (originalSize / 1024).toFixed(2), "KB");
  console.log("Optimized:", (optimizedSize / 1024).toFixed(2), "KB");
  console.log(
    "Reduced:",
    ((1 - optimizedSize / originalSize) * 100).toFixed(1) + "%"
  );
  console.log("Created:", output);
}

optimize().catch(console.error);
