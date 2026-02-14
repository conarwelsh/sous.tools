import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

import { config } from '../packages/config/src/index.js';

async function main() {
  const args = process.argv.slice(2);
  const channelArg = args.find(a => a.startsWith('--channel='));
  const channel = channelArg ? channelArg.split('=')[1] : 'staging'; // Default to staging

  console.log(`🚀 Publishing to ${channel.toUpperCase()} channel...`);

  const supabaseUrl = config.storage.supabase.url;
  const supabaseKey = config.storage.supabase.serviceRoleKey;

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in configuration');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const BUCKET = config.storage.supabase.bucket;
  
  // Use channel-specific folder
  const RELEASE_FOLDER = `releases/${channel}/latest`;
  
  const artifactsDir = path.resolve(process.cwd(), 'dist/artifacts');
  if (!fs.existsSync(artifactsDir)) {
    console.error(`❌ Artifacts directory not found: ${artifactsDir}`);
    process.exit(1);
  }

  const manifest: Record<string, string> = {
    updatedAt: new Date().toISOString(),
    channel,
  };

  async function uploadFile(filePath: string, destPath: string) {
    const fileContent = fs.readFileSync(filePath);
    const contentType = mime.lookup(filePath) || 'application/octet-stream';
    
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(destPath, fileContent, {
        contentType,
        upsert: true
      });
  
    if (error) {
      throw new Error(`Failed to upload ${destPath}: ${error.message}`);
    }
  
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(destPath);
      
    return publicUrlData.publicUrl;
  }

  // The download-artifact action puts each artifact in its own folder
  // dist/artifacts/signage-apk/app-signage-debug.apk
  const entries = fs.readdirSync(artifactsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const subDir = path.join(artifactsDir, entry.name);
      const files = fs.readdirSync(subDir);
      
      for (const file of files) {
        const filePath = path.join(subDir, file);
        const destName = file; 
        const publicUrl = await uploadFile(filePath, `${RELEASE_FOLDER}/${destName}`);
        console.log(`Uploaded: ${destName}`);
        
        // Map simplified keys for the frontend
        if (file.includes('signage')) manifest['signage'] = publicUrl;
        else if (file.includes('kds')) manifest['kds'] = publicUrl;
        else if (file.includes('pos')) manifest['pos'] = publicUrl;
        else if (file.includes('tools')) manifest['tools'] = publicUrl;
        else if (file.includes('wearos')) manifest['wearos'] = publicUrl;
        else if (file.includes('rpi4')) manifest['rpi'] = publicUrl;
      }
    }
  }

  // Upload Manifest
  const manifestPath = path.join(artifactsDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  await uploadFile(manifestPath, `${RELEASE_FOLDER}/manifest.json`);

  console.log(`✅ ${channel.toUpperCase()} Release published successfully!`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
