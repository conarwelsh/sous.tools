import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { SquareDriver } from './square.driver.js';
import { SousDriver } from './sous.driver.js';
import { GoogleDriveDriver } from './google-drive.driver.js';
import { DatabaseService } from '../../core/database/database.service.js';
import { PosService } from '../../pos/services/pos.service.js';
import { logger } from '@sous/logger';

@Injectable()
export class DriverFactory {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    @Inject(forwardRef(() => PosService))
    private readonly posService: PosService,
  ) {}

  getPOSDriver(provider: string, credentials: any, organizationId?: string) {
    switch (provider) {
      case 'square':
        return new SquareDriver(credentials);
      case 'sous':
        if (!organizationId)
          throw new Error(
            '[DriverFactory] organizationId required for Sous driver',
          );
        return new SousDriver(this.dbService, this.posService, organizationId);
      default:
        throw new Error(
          `[DriverFactory] Unsupported POS provider: ${provider}`,
        );
    }
  }

  getStorageDriver(provider: string, credentials: any) {
    switch (provider) {
      case 'google-drive':
        return new GoogleDriveDriver(credentials);
      default:
        throw new Error(
          `[DriverFactory] Unsupported storage provider: ${provider}`,
        );
    }
  }
}
