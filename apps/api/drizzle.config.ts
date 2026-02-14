import { defineConfig } from 'drizzle-kit';
import { config } from '@sous/config';

export default defineConfig({
  schema: './src/domains/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || config.db.url || '',
  },
});
