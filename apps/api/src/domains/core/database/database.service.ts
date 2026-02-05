import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { localConfig } from '@sous/config';
import * as schema from './schema.js';
import { logger } from '@sous/logger';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  public db: NodePgDatabase<typeof schema>;

  constructor() {
    this.pool = new Pool({
      connectionString: localConfig.db.url,
    });
    this.db = drizzle(this.pool, { schema });
  }

  async onModuleInit() {
    try {
      // Test connection
      await this.pool.query('SELECT 1');
      logger.info('🐘 Database connected successfully');
    } catch (error) {
      logger.error('❌ Database connection failed', error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
