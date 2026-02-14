import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { devices, pairingCodes, displays } from '../../core/database/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { RealtimeGateway } from '../../realtime/realtime.gateway.js';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class HardwareService {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly realtimeGateway: RealtimeGateway,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  async generatePairingCode(
    hardwareId: string,
    deviceType: any,
    metadata?: any,
  ) {
    try {
      // Clean device type (e.g. 'signage:primary' -> 'signage')
      const sanitizedType = String(deviceType).split(':')[0];

      // 1. Generate random 6-digit alphanumeric code
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // 2. Clear old codes for this hardware
      await this.dbService.db
        .delete(pairingCodes)
        .where(eq(pairingCodes.hardwareId, hardwareId));

      // 3. Save new code
      const result = await this.dbService.db
        .insert(pairingCodes)
        .values({
          code,
          deviceType: sanitizedType as any,
          hardwareId,
          metadata: JSON.stringify(metadata || {}),
          expiresAt,
        })
        .returning();

      return result[0];
    } catch (e) {
      console.error('❌ Failed to generate pairing code:', e);
      throw e;
    }
  }

  async pairDevice(code: string, organizationId: string, locationId?: string) {
    // 1. Find valid code
    const record = await this.dbService.db.query.pairingCodes.findFirst({
      where: and(
        eq(pairingCodes.code, code.toUpperCase()),
        gt(pairingCodes.expiresAt, new Date()),
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
      ? (
          await this.dbService.db
            .update(devices)
            .set({ organizationId, locationId, updatedAt: new Date() })
            .where(eq(devices.id, existingDevice.id))
            .returning()
        )[0]
      : (
          await this.dbService.db
            .insert(devices)
            .values({
              organizationId,
              locationId,
              hardwareId: record.hardwareId,
              type: record.deviceType,
              name: `${record.deviceType.toUpperCase()} Device`,
              metadata: record.metadata,
            })
            .returning()
        )[0];

    // 2.5 Special Case: Signage needs a Display entry to be visible in Signage Manager
    if (record.deviceType === 'signage') {
      const existingDisplay = await this.dbService.db.query.displays.findFirst({
        where: eq(displays.hardwareId, record.hardwareId),
      });

      if (!existingDisplay) {
        await this.dbService.db.insert(displays).values({
          organizationId,
          locationId,
          hardwareId: record.hardwareId,
          name: `${device.name} (Auto-created)`,
          isActive: true,
        });
      }
    }

    // 3. Notify Hardware
    this.realtimeGateway.emitToHardware(record.hardwareId, 'pairing:success', {
      organizationId,
      locationId,
    });

    // 4. Notify UI via GraphQL Subscription
    this.pubSub.publish('deviceUpdated', { deviceUpdated: device });
    this.pubSub.publish('devicePaired', { devicePaired: device });

    return device;
  }

  async heartbeat(hardwareId: string, metadata?: any) {
    const result = await this.dbService.db
      .update(devices)
      .set({
        lastHeartbeat: new Date(),
        status: 'online',
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      })
      .where(eq(devices.hardwareId, hardwareId))
      .returning();

    if (!result.length) {
      throw new NotFoundException(
        `Device with hardwareId ${hardwareId} not found`,
      );
    }

    const device = result[0];
    // Publish update
    this.pubSub.publish('deviceUpdated', { deviceUpdated: device });

    return {
      success: true,
      requiredVersion: device.requiredVersion,
    };
  }

  async getDevicesByOrg(organizationId: string) {
    return await this.dbService.db
      .select()
      .from(devices)
      .where(eq(devices.organizationId, organizationId));
  }
}
