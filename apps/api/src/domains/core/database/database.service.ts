import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config, resolveConfig } from '@sous/config';
import * as schema from './schema.js';
import { logger } from '@sous/logger';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  public db!: NodePgDatabase<typeof schema>;

  constructor() {
    try {
      if (config.db.url) {
        this.initializePool(config.db.url);
      }
    } catch (e) {
      // Configuration likely not resolved yet, will try again in onModuleInit
    }
  }

  private initializePool(url: string) {
    this.pool = new Pool({
      connectionString: url,
    });
    this.db = drizzle(this.pool, { schema });

    // Test connection asynchronously without blocking startup
    void this.testConnection();
  }

  async onModuleInit() {
    if (!this.pool) {
      logger.info('⏳ Waiting for configuration to load...');
      const resolved = await resolveConfig();
      if (!resolved.db.url) {
        logger.error(
          '❌ Database URL is still undefined after waiting for configuration',
        );
        throw new Error('Database configuration missing');
      }
      this.initializePool(resolved.db.url);
    }
    logger.info('🔌 Database service initialized');
  }

  async testConnection() {
    try {
      // Test connection
      await this.pool.query('SELECT 1');
      logger.info('🐘 Database connected successfully');
    } catch (error: any) {
      logger.error('❌ Database connection failed', error);
      // Don't exit process, allow retries on first request
    }
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.end();
  }

  /**
   * Run a set of operations within an organization-scoped transaction.
   * This sets the 'app.current_org_id' local variable which is used by RLS policies.
   */
  async scopedTransaction<T>(
    orgId: string,
    callback: (tx: NodePgDatabase<typeof schema>) => Promise<T>,
  ): Promise<T> {
    return await this.db.transaction(async (tx) => {
      // Set the session variable for the current transaction
      await tx.execute(`SET LOCAL app.current_org_id = '${orgId}'`);
      return await callback(tx);
    });
  }
}
