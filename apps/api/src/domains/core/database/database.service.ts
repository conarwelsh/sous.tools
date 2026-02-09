import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { getActiveConfig, configPromise } from '@sous/config';
import * as schema from './schema.js';
import { logger } from '@sous/logger';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;
  public db!: NodePgDatabase<typeof schema>;

  constructor() {
    const config = getActiveConfig();

    if (!config.db.url) {
      logger.warn(
        '⚠️ Database URL is undefined during constructor. Configuration may still be loading...',
      );
      // We will initialize the pool in onModuleInit if it's not ready here
      return;
    }

    this.initializePool(config.db.url);
  }

  private initializePool(url: string) {
    try {
      const parsed = new URL(url);
      console.log('DEBUG DB URL Check:', {
        protocol: parsed.protocol,
        host: parsed.host,
        port: parsed.port,
        user: parsed.username,
        passLength: parsed.password.length,
        db: parsed.pathname,
      });
    } catch (e) {
      console.error('DEBUG DB URL Parse Error:', url);
    }

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
      const config = await configPromise;
      if (!config.db.url) {
        logger.error(
          '❌ Database URL is still undefined after waiting for configPromise',
        );
        throw new Error('Database configuration missing');
      }
      this.initializePool(config.db.url);
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
