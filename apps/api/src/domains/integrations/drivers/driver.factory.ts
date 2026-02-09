import { Injectable } from '@nestjs/common';
import { SquareDriver } from './square.driver.js';

@Injectable()
export class DriverFactory {
  getPOSDriver(provider: string, credentials: any) {
    switch (provider) {
      case 'square':
        return new SquareDriver(credentials);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
}
