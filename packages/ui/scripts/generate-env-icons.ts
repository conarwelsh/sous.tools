import fs from "fs";
import path from "path";
import { Resvg } from "@resvg/resvg-js";
import sharp from "sharp";

const ENV_COLORS = {
  production: "#0ea5e9", // BRAND_BLUE
  staging: "#f59e0b", // BRAND_AMBER
  development: "#10b981", // BRAND_EMERALD
};

const SVG_TEMPLATE = (color: string) => `
<svg width="1024" height="1024" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>
  <g fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#glow)">
    <path d="M30 65 H70" />
    <path d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65" />
  </g>
</svg>
`;

async function generate() {
  const rootDir = path.resolve(process.cwd(), "../../");
  const targetApps = [
    { name: "web", path: "apps/web/public" },
    { name: "docs", path: "apps/docs/public" },
    { name: "native", path: "apps/native/public" },
    { name: "headless", path: "apps/signage/public" },
    { name: "pos", path: "apps/pos/public" },
    { name: "kds", path: "apps/kds/public" },
  ];

  // For local dev, we use 'development' color
  const color = ENV_COLORS.development;
  const svg = SVG_TEMPLATE(color);

  const resvg = new Resvg(svg);
  const pngData = resvg.render().asPng();

  for (const app of targetApps) {
    const fullPath = path.join(rootDir, app.path);
    if (!fs.existsSync(fullPath)) continue;

    console.log(`🎨 Generating icons for ${app.name}...`);

    // 1. Favicon (32x32)
    await sharp(pngData)
      .resize(32, 32)
      .toFile(path.join(fullPath, "favicon.ico"));

    // 2. Apple Touch Icon (180x180)
    await sharp(pngData)
      .resize(180, 180)
      .toFile(path.join(fullPath, "apple-touch-icon.png"));

    // 3. Large Logo (512x512)
    await sharp(pngData)
      .resize(512, 512)
      .toFile(path.join(fullPath, "icon-512.png"));

    // 4. SVG Version
    fs.writeFileSync(path.join(fullPath, "logo.svg"), svg);
  }

  console.log("✅ Environment-aware icons generated.");
}

generate().catch(console.error);
