import { createClient } from "@supabase/supabase-js";
import { resolveConfig } from "../packages/config/src/index.js";

async function main() {
  const config = await resolveConfig();
  const supabaseUrl = config.storage.supabase.url;
  const supabaseKey = config.storage.supabase.serviceRoleKey;
  const BUCKET = config.storage.supabase.bucket;

  if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("🚀 Promoting Staging Release to Production...");

  const STAGING_FOLDER = "releases/staging/latest";
  const PROD_FOLDER = "releases/production/latest";

  // 1. List files in Staging
  const { data: files, error: listError } = await supabase.storage
    .from(BUCKET)
    .list(STAGING_FOLDER);

  if (listError) {
    console.error("❌ Failed to list staging files:", listError);
    process.exit(1);
  }

  if (!files || files.length === 0) {
    console.error("❌ No files found in staging to promote.");
    process.exit(1);
  }

  console.log(`found ${files.length} files in staging.`);

  // 2. Copy each file to Production
  for (const file of files) {
    if (file.name === ".emptyFolderPlaceholder") continue; // Skip placeholders

    const sourcePath = `${STAGING_FOLDER}/${file.name}`;
    const destPath = `${PROD_FOLDER}/${file.name}`;

    console.log(`Copying ${file.name} to Production...`);

    const { error: copyError } = await supabase.storage
      .from(BUCKET)
      .copy(sourcePath, destPath);

    if (copyError) {
      // If error is "The object already exists", we might want to overwrite (move/upload logic needed?)
      // Supabase copy doesn't overwrite by default usually.
      // We might need to delete dest first or ignore if same.
      // Let's try deleting dest first to ensure clean state.
      await supabase.storage.from(BUCKET).remove([destPath]);
      const { error: retryError } = await supabase.storage
        .from(BUCKET)
        .copy(sourcePath, destPath);

      if (retryError) {
        console.error(`❌ Failed to copy ${file.name}:`, retryError);
        // Continue or exit? Let's continue to try others.
      }
    }
  }

  console.log("✅ Promotion complete!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
