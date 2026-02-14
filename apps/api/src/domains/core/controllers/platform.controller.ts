import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PlatformService } from '../services/platform.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { RolesGuard } from '../../iam/auth/guards/roles.guard.js';
import { Roles } from '../../iam/auth/decorators/roles.decorator.js';

@Controller('platform')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlatformController {
  constructor(private readonly platformService: PlatformService) {}

  @Get('settings')
  @Roles('superadmin')
  async getSettings() {
    return this.platformService.getAllSettings();
  }

  @Post('settings')
  @Roles('superadmin')
  async updateSetting(@Body() body: { key: string; value: string }) {
    await this.platformService.setSetting(body.key, body.value);
    return { success: true };
  }
}
