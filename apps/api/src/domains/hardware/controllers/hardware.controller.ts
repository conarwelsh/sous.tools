import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { HardwareService } from '../services/hardware.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('hardware')
export class HardwareController {
  constructor(private readonly hardwareService: HardwareService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getDevices(@Req() req: any) {
    return this.hardwareService.getDevicesByOrg(req.user.orgId);
  }

  @Post('pairing-code')
  async getCode(
    @Body() body: { hardwareId: string; type: string; metadata?: any },
  ) {
    console.log(
      `[Hardware] Pairing code requested for ${body.hardwareId} (${body.type})`,
    );
    return this.hardwareService.generatePairingCode(
      body.hardwareId,
      body.type as any,
      body.metadata,
    );
  }

  @Post('pair')
  @UseGuards(JwtAuthGuard)
  async pair(
    @Body() body: { code: string; locationId?: string },
    @Req() req: any,
  ) {
    return this.hardwareService.pairDevice(
      body.code,
      req.user.orgId,
      body.locationId,
    );
  }

  @Post('heartbeat')
  async heartbeat(@Body() body: { hardwareId: string; metadata?: any }) {
    return this.hardwareService.heartbeat(body.hardwareId, body.metadata);
  }
}
