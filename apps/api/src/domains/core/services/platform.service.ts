import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { platformSettings } from '../database/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class PlatformService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

  async getSetting(key: string): Promise<string | null> {
    const setting = await this.dbService.db.query.platformSettings.findFirst({
      where: eq(platformSettings.key, key),
    });
    return setting?.value ?? null;
  }

  async setSetting(key: string, value: string): Promise<void> {
    await this.dbService.db
      .insert(platformSettings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: platformSettings.key,
        set: { value, updatedAt: new Date() },
      });
    logger.info(`[Platform] Setting updated: ${key}=${value}`);
  }

  async getAllSettings() {
    return this.dbService.db.query.platformSettings.findMany();
  }
}
