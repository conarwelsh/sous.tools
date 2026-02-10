import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../apps/api/src/domains/core/database/schema.js';
import { sql } from 'drizzle-orm';
import { resolveConfig } from '../packages/config/src/index.js';

async function wipe(db: any) {
  console.log('🔥 Wiping database (Dropping all tables and enums)...');
  
  // Drop tables
  const tables = [
    'costing_snapshots', 'devices', 'display_assignments', 'displays', 
    'general_ledger', 'integration_configs', 'invoice_items', 'invoices', 
    'locations', 'media', 'organizations', 'pairing_codes', 'price_trends', 
    'reports', 'stock_ledger', 'suppliers', 'telemetry', 'ingredients', 
    'recipes', 'templates', 'users', 'recipe_ingredients'
  ];
  
  for (const table of tables) {
    console.log(`  └─ Dropping table ${table}...`);
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`));
  }

  // Drop enums
  const enums = ['role', 'device_type'];
  for (const e of enums) {
    console.log(`  └─ Dropping enum ${e}...`);
    await db.execute(sql.raw(`DROP TYPE IF EXISTS "${e}" CASCADE`));
  }
  
  console.log('✅ Database wiped (Dropped everything).');
}

async function main() {
  const config = await resolveConfig();
  const dbUrl = config.db.url;
  if (!dbUrl) {
    console.error('DATABASE_URL is missing');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: dbUrl });
  const db = drizzle(pool, { schema });

  const cmd = process.argv[2];
  if (cmd === 'wipe') {
    await wipe(db);
  } else {
    console.error('Unknown command. Use "wipe".');
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
