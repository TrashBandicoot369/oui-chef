// compress-images.ts
import fs from "fs";
import path from "path";
import sharp from "sharp";

const inputDir = path.join(__dirname, "public/images");
const outputDir = path.join(__dirname, "public/images/optimized");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(inputDir);

files.forEach(async (file) => {
  const ext = path.extname(file).toLowerCase();
  const valid = [".jpg", ".jpeg", ".png"];

  if (!valid.includes(ext)) return;

  const inputPath = path.join(inputDir, file);
  const outputPath = path.join(outputDir, file);

  try {
    await sharp(inputPath)
      .resize({ width: 1600 }) // adjust for web max width
      .toFormat("webp", { quality: 80 }) // save as webp (optional)
      .toFile(outputPath.replace(ext, ".webp"));

    console.log(`✓ Compressed: ${file}`);
  } catch (err) {
    console.error(`✗ Failed: ${file}`, err);
  }
});

