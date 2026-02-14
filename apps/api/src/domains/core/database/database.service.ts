import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { config } from '@sous/config';
import * as schema from './schema.js';
import { logger } from '@sous/logger';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private writerPool!: Pool;
  private readerPool!: Pool;
  public db!: NodePgDatabase<typeof schema>;
  public readDb!: NodePgDatabase<typeof schema>;

  constructor() {}

  private initializePools() {
    const writerUrl = config.db.url;

    if (!writerUrl) {
      logger.error('❌ Database Writer URL is undefined in configuration');
      throw new Error('Database configuration missing');
    }

    const readerUrl = config.db.readerUrl || writerUrl;

    logger.info(`🐘 Initializing Writer Pool: ${writerUrl.replace(/:.*@/, ':****@')}`);
    this.writerPool = new Pool({ connectionString: writerUrl });
    this.db = drizzle(this.writerPool, { schema });

    logger.info(`🐘 Initializing Reader Pool: ${readerUrl.replace(/:.*@/, ':****@')}`);
    this.readerPool = new Pool({ connectionString: readerUrl });
    this.readDb = drizzle(this.readerPool, { schema });

    // Test connections
    void this.testConnections();
  }

  onModuleInit() {
    logger.info('🔌 Initializing Database service...');
    this.initializePools();
    logger.info('🔌 Database service initialized');
  }

  async testConnections() {
    try {
      await this.writerPool.query('SELECT 1');
      logger.info('🐘 Writer Database connected successfully');
      
      if (this.readerPool !== this.writerPool) {
        await this.readerPool.query('SELECT 1');
        logger.info('🐘 Reader Database connected successfully');
      }
    } catch (error: any) {
      logger.error('❌ Database connection failed', error);
    }
  }

  async onModuleDestroy() {
    if (this.writerPool) await this.writerPool.end();
    if (this.readerPool && this.readerPool !== this.writerPool) {
      await this.readerPool.end();
    }
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
