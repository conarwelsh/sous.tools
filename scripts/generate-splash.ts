import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * SOUS Brand Asset Generator
 * Generates all platform-specific branding artifacts from high-fidelity SVG definitions.
 * This includes:
 * - RPi Boot Splash (PNG)
 * - Windows System Tray Icon (ICO/PNG)
 * - Web/Mobile Favicons & App Icons
 */

const THEME = {
  bg: '#0a0a0a',
  primary: '#0091FF',
  sec: '#FFFFFF',
  muted: '#52525b',
};

// Simple SVG path-based versions of our logos for Sharp rendering
// (Mirroring AtelierLogos.tsx but simplified for SSR/Scripting)
const LOGOS = {
  // BrandCloud from AtelierLogos.tsx
  cloud: `
    <g transform="translate(50, 50) scale(1.0) translate(-50, -50)">
      <path d="M30 65 Q20 65 20 50 Q20 35 35 35 Q35 20 50 20 Q65 20 65 35 Q80 35 80 50 Q80 65 70 65" stroke="${THEME.primary}" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M30 65 L70 65" stroke="${THEME.sec}" stroke-width="4" stroke-linecap="round"/>
    </g>
  `,
  // AtelierLogo (Flask) from AtelierLogos.tsx - Simplified for static
  plate: `
    <g transform="translate(50, 50) scale(1.0) translate(-50, -50)">
       <path
          d="M35,20 L35,44 L20,80 L80,80 L65,44 L65,20"
          stroke="${THEME.primary}"
          stroke-width="6"
          fill="none"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <path
          d="M28,60 L20,80 L80,80 L72,60 Z"
          fill="${THEME.primary}"
          fill-opacity="0.3"
          stroke="none"
        />
        <line x1="25" y1="20" x2="75" y2="20" stroke="${THEME.primary}" stroke-width="6" stroke-linecap="round"/>
    </g>
  `
};

function getSVG(content: string, width: number, height: number, includeText = false) {
  return `
    <svg width="${width}" height="${height}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${THEME.bg}"/>
      ${content}
      ${includeText ? `
        <text x="50" y="85" fill="white" font-family="sans-serif" font-size="12" font-weight="900" text-anchor="middle" letter-spacing="-0.05em">
          SOUS<tspan fill="${THEME.primary}">.</tspan><tspan font-weight="400" fill="${THEME.muted}">tools</tspan>
        </text>
      ` : ''}
    </svg>
  `;
}

async function generate() {
  const assetsDir = path.join(process.cwd(), 'packages/ui/assets');
  const logosDir = path.join(assetsDir, 'logos');
  const winAgentDir = '/mnt/c/tools/sous-agent';
  const repoWinDir = path.join(process.cwd(), 'scripts/windows');

  [assetsDir, logosDir, repoWinDir].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  console.log('🎨 Generating Brand Assets...');

  // Use THE CLOUD as the primary logo for now
  const PRIMARY_LOGO = LOGOS.cloud;

  // 1. RPi Boot Splash (1920x1080)
  const splashSVG = `
    <svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${THEME.bg}"/>
      <g transform="translate(760, 290) scale(4)">
        ${PRIMARY_LOGO}
      </g>
      <text x="960" y="750" fill="white" font-family="sans-serif" font-size="80" font-weight="900" text-anchor="middle" letter-spacing="-0.05em">
        SOUS<tspan fill="${THEME.primary}">.</tspan><tspan font-weight="400" fill="${THEME.muted}">tools</tspan>
      </text>
      <text x="960" y="850" fill="${THEME.muted}" font-family="monospace" font-size="24" text-anchor="middle" letter-spacing="0.2em">
        CULINARY OPERATIONS PLATFORM
      </text>
    </svg>
  `;
  await sharp(Buffer.from(splashSVG)).png().toFile(path.join(assetsDir, 'boot-splash.png'));
  console.log('✅ Generated: boot-splash.png');

  // 2. Windows Agent Icon (256x256)
  const agentSVG = getSVG(PRIMARY_LOGO, 256, 256);
  const agentPngPath = path.join(repoWinDir, 'agent.png');
  await sharp(Buffer.from(agentSVG)).png().toFile(agentPngPath);
  
  // Try to copy to Windows if path exists
  if (fs.existsSync(winAgentDir)) {
    try {
      fs.copyFileSync(agentPngPath, path.join(winAgentDir, 'agent.png'));
      console.log('✅ Updated Windows Agent: agent.png');
    } catch (e) {
      console.warn('⚠️ Could not write directly to C:\\tools\\sous-agent. Ensure directory is writable.');
    }
  }

  // 3. Various Logo Sizes for Apps
  const sizes = [16, 32, 48, 64, 128, 256, 512];
  for (const size of sizes) {
    await sharp(Buffer.from(getSVG(PRIMARY_LOGO, size, size)))
      .png()
      .toFile(path.join(logosDir, `logo-${size}.png`));
  }
  console.log(`✅ Generated ${sizes.length} logo sizes in packages/ui/assets/logos/`);

  // 4. Capacitor Web App Assets (apps/web/assets/)
  const capAssetsDir = path.join(process.cwd(), 'apps/web/assets');
  if (!fs.existsSync(capAssetsDir)) fs.mkdirSync(capAssetsDir, { recursive: true });

  // Icon (512x512)
  await sharp(Buffer.from(getSVG(PRIMARY_LOGO, 1024, 1024)))
    .png()
    .toFile(path.join(capAssetsDir, 'icon.png'));
  
  // Also split versions for better adaptive icon generation
  await sharp(Buffer.from(getSVG(PRIMARY_LOGO, 1024, 1024)))
    .png()
    .toFile(path.join(capAssetsDir, 'icon-only.png'));
  
  // Foreground (no background)
  const foregroundSVG = `
    <svg width="1024" height="1024" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      ${PRIMARY_LOGO}
    </svg>
  `;
  await sharp(Buffer.from(foregroundSVG))
    .png()
    .toFile(path.join(capAssetsDir, 'icon-foreground.png'));
  
  // Background (just the color)
  const backgroundSVG = `
    <svg width="1024" height="1024" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${THEME.bg}"/>
    </svg>
  `;
  await sharp(Buffer.from(backgroundSVG))
    .png()
    .toFile(path.join(capAssetsDir, 'icon-background.png'));

  // Splash (2732x2732)
  const appSplashSVG = `
    <svg width="2732" height="2732" viewBox="0 0 2732 2732" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${THEME.bg}"/>
      <g transform="translate(1166, 1166) scale(4)">
        ${PRIMARY_LOGO}
      </g>
    </svg>
  `;
  await sharp(Buffer.from(appSplashSVG))
    .png()
    .toFile(path.join(capAssetsDir, 'splash.png'));
  await sharp(Buffer.from(appSplashSVG))
    .png()
    .toFile(path.join(capAssetsDir, 'splash-dark.png'));

  console.log('✅ Generated Capacitor assets in apps/web/assets/');

  console.log('\n✨ All assets synchronized.');
}

generate().catch(console.error);