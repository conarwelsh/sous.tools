import { defineConfig } from 'drizzle-kit';
import { localConfig } from '@sous/config';

export default defineConfig({
  schema: './src/domains/**/*.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: localConfig.db.url || '',
  },
});
