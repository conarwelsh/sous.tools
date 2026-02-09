import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { integrationConfigs } from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';
import { DriverFactory } from '../drivers/driver.factory.js';

@Injectable()
export class IntegrationsService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly driverFactory: DriverFactory,
  ) {}

  async getIntegration(organizationId: string, provider: string) {
    return this.dbService.db.query.integrationConfigs.findFirst({
      where: (ic) =>
        and(eq(ic.organizationId, organizationId), eq(ic.provider, provider)),
    });
  }

  async connect(organizationId: string, provider: string, credentials: any) {
    // Encrypt credentials here (Mocking for now)
    const encrypted = JSON.stringify(credentials);

    await this.dbService.db.insert(integrationConfigs).values({
      organizationId,
      provider,
      encryptedCredentials: encrypted,
      settings: '{}',
    });
  }

  async sync(organizationId: string, provider: string) {
    const config = await this.getIntegration(organizationId, provider);
    if (!config) throw new Error('Integration not found');

    const credentials = JSON.parse(config.encryptedCredentials);
    const driver = this.driverFactory.getPOSDriver(provider, credentials);

    if (provider === 'square') {
      const sales = await driver.fetchSales(
        new Date(Date.now() - 24 * 60 * 60 * 1000),
        new Date(),
      );
      return { status: 'synced', salesCount: sales.length };
    }

    return { status: 'unknown_provider' };
  }
}
