import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { devices, pairingCodes } from '../../core/database/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { RealtimeGateway } from '../../realtime/realtime.gateway.js';

@Injectable()
export class HardwareService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async generatePairingCode(hardwareId: string, deviceType: any, metadata?: any) {
    // 1. Generate random 6-digit alphanumeric code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 2. Clear old codes for this hardware
    await this.dbService.db.delete(pairingCodes).where(eq(pairingCodes.hardwareId, hardwareId));

    // 3. Save new code
    const result = await this.dbService.db.insert(pairingCodes).values({
      code,
      deviceType,
      hardwareId,
      metadata: JSON.stringify(metadata || {}),
      expiresAt,
    }).returning();

    return result[0];
  }

  async pairDevice(code: string, organizationId: string, locationId?: string) {
    // 1. Find valid code
    const record = await this.dbService.db.query.pairingCodes.findFirst({
      where: and(
        eq(pairingCodes.code, code.toUpperCase()),
        gt(pairingCodes.expiresAt, new Date())
      ),
    });

    if (!record) {
      throw new NotFoundException('Invalid or expired pairing code');
    }

    // 2. Create or Update Device
    const existingDevice = await this.dbService.db.query.devices.findFirst({
      where: eq(devices.hardwareId, record.hardwareId),
    });

    const device = existingDevice 
      ? (await this.dbService.db.update(devices)
          .set({ organizationId, locationId, updatedAt: new Date() })
          .where(eq(devices.id, existingDevice.id))
          .returning())[0]
      : (await this.dbService.db.insert(devices).values({
          organizationId,
          locationId,
          hardwareId: record.hardwareId,
          type: record.deviceType,
          name: `${record.deviceType.toUpperCase()} Device`,
          metadata: record.metadata,
        }).returning())[0];

    // 3. Notify Hardware
    this.realtimeGateway.emitToHardware(record.hardwareId, 'pairing:success', {
      organizationId,
      locationId,
    });

    return device;
  }

  async heartbeat(hardwareId: string, metadata?: any) {
    return await this.dbService.db.update(devices)
      .set({ 
        lastHeartbeat: new Date(), 
        status: 'online',
        metadata: metadata ? JSON.stringify(metadata) : undefined 
      })
      .where(eq(devices.hardwareId, hardwareId));
  }

  async getDevicesByOrg(organizationId: string) {
    return await this.dbService.db.select().from(devices).where(eq(devices.organizationId, organizationId));
  }
}
