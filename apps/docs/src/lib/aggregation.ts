import fs from 'fs';
import path from 'path';

export interface DocNode {
  name: string;
  path: string;
  content: string;
  type: 'app' | 'package' | 'adr' | 'spec';
}

export function aggregateDocs(): DocNode[] {
  const rootDir = path.resolve(process.cwd(), '../../');
  const docs: DocNode[] = [];

  // 1. Apps
  const appsDir = path.join(rootDir, 'apps');
  if (fs.existsSync(appsDir)) {
    const apps = fs.readdirSync(appsDir);
    for (const app of apps) {
      const readmePath = path.join(appsDir, app, 'README.md');
      if (fs.existsSync(readmePath)) {
        docs.push({
          name: `@sous/${app}`,
          path: `apps/${app}`,
          content: fs.readFileSync(readmePath, 'utf-8'),
          type: 'app',
        });
      }
    }
  }

  // 2. Packages
  const packagesDir = path.join(rootDir, 'packages');
  if (fs.existsSync(packagesDir)) {
    const packages = fs.readdirSync(packagesDir);
    for (const pkg of packages) {
      const readmePath = path.join(packagesDir, pkg, 'README.md');
      if (fs.existsSync(readmePath)) {
        docs.push({
          name: `@sous/${pkg}`,
          path: `packages/${pkg}`,
          content: fs.readFileSync(readmePath, 'utf-8'),
          type: 'package',
        });
      }
    }
  }

  // 3. ADRs
  const adrDir = path.join(rootDir, '.gemini/docs/ADRs');
  if (fs.existsSync(adrDir)) {
    const adrs = fs.readdirSync(adrDir);
    for (const adr of adrs) {
      if (adr.endsWith('.md')) {
        docs.push({
          name: adr.replace('.md', ''),
          path: `.gemini/docs/ADRs/${adr}`,
          content: fs.readFileSync(path.join(adrDir, adr), 'utf-8'),
          type: 'adr',
        });
      }
    }
  }

  return docs;
}
