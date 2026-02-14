import { Client } from "pg";

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  // Mask password for logging
  const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ":****@");
  console.log(`🔥 Connecting to database: ${maskedUrl}`);

  const client = new Client({ connectionString: dbUrl });

  try {
    await client.connect();
    console.log('🔥 Connected. Dropping schema "public" (CASCADE)...');

    await client.query("DROP SCHEMA IF EXISTS public CASCADE;");
    await client.query("CREATE SCHEMA public;");
    await client.query("GRANT ALL ON SCHEMA public TO public;");

    console.log("✅ Public schema recreated successfully.");
  } catch (e) {
    console.error("❌ Failed to wipe database:", e);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
