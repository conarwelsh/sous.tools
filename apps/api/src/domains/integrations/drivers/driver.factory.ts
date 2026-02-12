import { Injectable } from '@nestjs/common';
import { SquareDriver } from './square.driver.js';
import { GoogleDriveDriver } from './google-drive.driver.js';

@Injectable()
export class DriverFactory {
  getPOSDriver(provider: string, credentials: any) {
    switch (provider) {
      case 'square':
        return new SquareDriver(credentials);
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
