import { Injectable } from '@nestjs/common';
import { AuthService } from '../../iam/auth/auth.service.js';
import { Seeder } from './base.seeder.js';
import { logger } from '@sous/logger';

@Injectable()
export class IamSeeder implements Seeder {
  constructor(private readonly authService: AuthService) {}

  async seedSystem(): Promise<string> {
    logger.info('🌱 Seeding IAM System Data...');
    return this.authService.seedSystem();
  }

  async seedSample(): Promise<void> {
    logger.info('🌱 Seeding IAM Sample Data...');
    await this.authService.seedSample();
  }
}
