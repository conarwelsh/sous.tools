import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getActiveConfig } from '@sous/config';
import * as schema from './schema.js';
import { logger } from '@sous/logger';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  public db!: NodePgDatabase<typeof schema>;

  onModuleInit() {
    const config = getActiveConfig();
    
    this.pool = new Pool({
      connectionString: config.db.url,
    });
    this.db = drizzle(this.pool, { schema });

    return this.testConnection();
  }

  async testConnection() {
    try {
      // Test connection
      await this.pool.query('SELECT 1');
      logger.info('🐘 Database connected successfully');
    } catch (error: any) {
      logger.error('❌ Database connection failed', error);
      process.exit(1);
    }
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.end();
  }
}
