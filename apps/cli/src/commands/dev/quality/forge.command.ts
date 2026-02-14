import { Command, CommandRunner, Option } from 'nest-commander';
import { logger } from '@sous/logger';
import { Resvg } from '@resvg/resvg-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { findProjectRootSync } from '@sous/config/server-utils';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { 
  BrandCloud, 
  BrandWhisk, 
  BrandHatGear, 
  BrandMorph, 
  BrandKitchenLine,
  ApiLogo,
  PosLogo,
  KdsLogo,
  SignageLogo,
  DocsLogo
} from '@sous/ui';

@Command({
  name: 'forge',
  description: 'Generate brand assets from branding.config.json',
})
export class ForgeCommand extends CommandRunner {
  async run(inputs: string[], options: any): Promise<void> {
    const rootDir = findProjectRootSync();
    const configPath = path.join(rootDir, 'branding.config.json');

    if (!fs.existsSync(configPath)) {
      logger.error('branding.config.json not found at project root');
      return;
    }

    let config: any;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e: any) {
      logger.error(`Failed to parse branding.config.json: ${e.message}`);
      return;
    }

    logger.info('🚀 Starting Asset Forge...');

    for (const [target, cfg] of Object.entries(config)) {
      try {
        await this.forgeAsset(target, cfg as any, rootDir);
      } catch (e: any) {
        logger.error(`❌ Failed to forge ${target}: ${e.message}`);
      }
    }

    logger.info('✅ Asset Forge complete.');
  }

  private async forgeAsset(target: string, cfg: any, rootDir: string) {
    logger.info(`  └─ Forging: ${target} (${cfg.variant}, ${cfg.size}px)...`);

    let svgString = this.renderLogoToSvg(cfg.variant, cfg.size, cfg.props || {});
    
    // Ensure xmlns is present for Resvg
    if (!svgString.includes('xmlns=')) {
      svgString = svgString.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    }

    const resvg = new Resvg(svgString, {
      fitTo: { mode: 'width', value: cfg.size }
    });
    const pngBuffer = resvg.render().asPng();

    const paths = this.getPathsForTarget(target, rootDir);
    
    for (const outPath of paths) {
      const dir = path.dirname(outPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      await sharp(pngBuffer)
        .resize(cfg.size, cfg.size)
        .toFile(outPath);
        
      logger.info(`     ✅ Saved: ${path.relative(rootDir, outPath)}`);
    }
  }

  private renderLogoToSvg(variant: string, size: number, props: any): string {
    let Component: any;
    switch (variant) {
      case 'api': Component = ApiLogo; break;
      case 'cloud': 
      case 'neon': Component = BrandCloud; break;
      case 'morph': Component = BrandMorph; break;
      case 'whisk': Component = BrandWhisk; break;
      case 'circuit':
      case 'hat-and-gear': Component = BrandHatGear; break;
      case 'plate':
      case 'kitchen-line': Component = BrandKitchenLine; break;
      case 'pos': Component = PosLogo; break;
      case 'kds': Component = KdsLogo; break;
      case 'signage': Component = SignageLogo; break;
      case 'tools':
      case 'line': Component = DocsLogo; break;
      default: Component = BrandCloud;
    }

    return renderToStaticMarkup(
      React.createElement(Component, { 
        size, 
        animState: 'static',
        ...props 
      })
    );
  }

  private getPathsForTarget(target: string, rootDir: string): string[] {
    switch (target) {
      case 'favicon':
        return [
          path.join(rootDir, 'apps/web/public/favicon.png'),
          path.join(rootDir, 'apps/docs/public/favicon.png'),
        ];
      case 'app-icon':
        return [
          path.join(rootDir, 'apps/web/public/icon.png'),
          // Android res paths vary, but let's target the web public for now as a base
          path.join(rootDir, 'apps/web/public/app-icon.png'),
        ];
      case 'pos-logo':
        return [path.join(rootDir, 'apps/web/public/logos/pos.png')];
      case 'kds-logo':
        return [path.join(rootDir, 'apps/web/public/logos/kds.png')];
      case 'signage-logo':
        return [path.join(rootDir, 'apps/web/public/logos/signage.png')];
      case 'api-logo':
        return [path.join(rootDir, 'apps/web/public/logos/api.png')];
      default:
        return [path.join(rootDir, `apps/web/public/generated/${target}.png`)];
    }
  }
}
