import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { locations, devices } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { HardwareAuthGuard } from '../../hardware/guards/hardware-auth.guard.js';

@Controller('iam/locations')
export class LocationsController {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Returns the location context for the current requester.
   * If the requester is a hardware device, it returns its assigned location.
   * If the requester is a user, it returns the primary location for their organization.
   */
  @Get('current')
  @UseGuards(JwtAuthGuard) // Can be extended with HardwareAuthGuard if needed
  async getCurrentLocation(@Req() req: any) {
    const user = req.user;

    // Hardware Context
    if (user.isHardware) {
      const hardwareId = user.id.replace('hw-', '');
      const device = await this.dbService.readDb.query.devices.findFirst({
        where: eq(devices.hardwareId, hardwareId),
        with: {
          location: true,
        },
      });
      return (device as any)?.location;
    }

    // User Context
    return await this.dbService.readDb.query.locations.findFirst({
      where: eq(locations.organizationId, user.organizationId),
    });
  }
}
