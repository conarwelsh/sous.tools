import { defineConfig } from 'drizzle-kit';
import { config } from '@sous/config';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '../../.env' });

export default defineConfig({
  schema: './src/domains/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || config.db.url || '',
  },
});
