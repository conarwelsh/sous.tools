import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { devices } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { RealtimeGateway } from '../../realtime/realtime.gateway.js';

@Injectable()
export class RemoteConfigService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async updateConfig(hardwareId: string, config: any) {
    // 1. Update DB
    await this.dbService.db
      .update(devices)
      .set({ metadata: JSON.stringify(config) })
      .where(eq(devices.hardwareId, hardwareId));

    // 2. Push to Device
    this.realtimeGateway.emitToHardware(hardwareId, 'config:update', config);
    return { status: 'pushed' };
  }

  async rebootDevice(hardwareId: string) {
    this.realtimeGateway.emitToHardware(hardwareId, 'system:reboot', {});
    return { status: 'command_sent' };
  }
}
