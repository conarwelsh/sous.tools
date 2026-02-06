import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { integrationConfigs } from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class IntegrationsService {
  constructor(private readonly dbService: DatabaseService) {}

  async getIntegration(organizationId: string, provider: string) {
    return this.dbService.db.query.integrationConfigs.findFirst({
      where: (ic) => and(eq(ic.organizationId, organizationId), eq(ic.provider, provider)),
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

    // Factory Logic
    if (provider === 'square') {
      return this.syncSquare(config);
    }
    return { status: 'unknown_provider' };
  }

  private async syncSquare(config: any) {
    // Mock Square Driver
    return { status: 'synced', sales: 100 };
  }
}
