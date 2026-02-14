import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { devices } from '../../hardware/hardware.schema.js';
import { logger } from '@sous/logger';
import { Seeder } from './base.seeder.js';

@Injectable()
export class HardwareSeeder implements Seeder {
  constructor(private readonly dbService: DatabaseService) {}

  async seedSystem(orgId?: string): Promise<void> {
    // System-level hardware if any
  }

  async seedSample(orgId: string): Promise<void> {
    logger.info('🌱 Seeding sample hardware for org: ' + orgId);

    const mockSensors = [
      {
        name: 'Walk-in Cooler',
        hardwareId: 'BLE-TEMP-001',
        type: 'gateway' as const,
        metadata: JSON.stringify({
          type: 'thermometer',
          unit: 'C',
          temp: 3.2,
          battery: 85,
        }),
        status: 'online',
      },
      {
        name: 'Prep Line Fridge',
        hardwareId: 'BLE-TEMP-002',
        type: 'gateway' as const,
        metadata: JSON.stringify({
          type: 'thermometer',
          unit: 'C',
          temp: 4.1,
          battery: 92,
        }),
        status: 'online',
      },
      {
        name: 'Dishwasher',
        hardwareId: 'BLE-TEMP-003',
        type: 'gateway' as const,
        metadata: JSON.stringify({
          type: 'thermometer',
          unit: 'C',
          temp: 82.5,
          battery: 45,
        }),
        status: 'online',
      },
    ];

    for (const sensor of mockSensors) {
      await this.dbService.db
        .insert(devices)
        .values({
          ...sensor,
          organizationId: orgId,
        })
        .onConflictDoUpdate({
          target: devices.hardwareId,
          set: {
            status: sensor.status,
            metadata: sensor.metadata,
          },
        });
    }
  }
}
