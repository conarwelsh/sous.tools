import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  UseGuards,
  Req,
  Query,
  Res,
  Param,
} from '@nestjs/common';
import { IntegrationsService } from '../services/integrations.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { config } from '@sous/config';
import { logger } from '@sous/logger';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('square/authorize')
  @UseGuards(JwtAuthGuard)
  async authorizeSquare(@Req() req: any) {
    logger.info(
      `[IntegrationsController] authorizeSquare hit for org: ${req.user.organizationId}`,
    );
    const url = await this.integrationsService.getSquareAuthorizeUrl(
      req.user.organizationId,
    );
    return { url };
  }

  @Get('google-drive/authorize')
  @UseGuards(JwtAuthGuard)
  async authorizeGoogle(@Req() req: any) {
    const url = await this.integrationsService.getGoogleAuthorizeUrl(
      req.user.organizationId,
    );
    return { url };
  }

  @Get('google-drive/files')
  @UseGuards(JwtAuthGuard)
  async listGoogleDriveFiles(
    @Query('folderId') folderId: string,
    @Req() req: any,
  ) {
    return this.integrationsService.listGoogleDriveFiles(
      req.user.organizationId,
      folderId,
    );
  }

  @Get('google-drive/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: any,
  ) {
    try {
      await this.integrationsService.handleGoogleCallback(code, state);
      return res.redirect(
        `${config.web.url}/settings/integrations?status=success&provider=google-drive`,
      );
    } catch (error) {
      return res.redirect(
        `${config.web.url}/settings/integrations?status=error&provider=google-drive`,
      );
    }
  }

  @Get('square/callback')
  async squareCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: any,
  ) {
    try {
      logger.info(
        `[IntegrationsController] squareCallback hit. code: ${code} state: ${state}`,
      );
      await this.integrationsService.handleSquareCallback(code, state);
      // Redirect back to frontend integrations page
      return res.redirect(
        `${config.web.url}/settings/integrations?status=success&provider=square`,
      );
    } catch (error: any) {
      logger.error(
        `[IntegrationsController] squareCallback error: ${error.message}`,
      );
      return res.redirect(
        `${config.web.url}/settings/integrations?status=error&provider=square`,
      );
    }
  }

  @Post('connect')
  @UseGuards(JwtAuthGuard)
  async connect(
    @Body() body: { provider: string; credentials: any },
    @Req() req: any,
  ) {
    await this.integrationsService.connect(
      req.user.organizationId,
      body.provider,
      body.credentials,
    );
    return { status: 'connected' };
  }

  @Post('sync')
  @UseGuards(JwtAuthGuard)
  async sync(
    @Body() body: { provider: string; fileId?: string },
    @Req() req: any,
  ) {
    return this.integrationsService.sync(
      req.user.organizationId,
      body.provider,
      { fileId: body.fileId },
    );
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard)
  async seed(@Body() body: { provider: string }, @Req() req: any) {
    return this.integrationsService.seed(
      req.user.organizationId,
      body.provider,
    );
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getIntegrations(@Req() req: any) {
    const configs = await this.integrationsService.getIntegrations(
      req.user.organizationId,
    );
    return configs.map((c) => ({
      provider: c.provider,
      isActive: c.isActive,
      lastSyncedAt: c.lastSyncedAt,
      updatedAt: c.updatedAt,
    }));
  }

  @Delete(':provider')
  @UseGuards(JwtAuthGuard)
  async disconnect(@Param('provider') provider: string, @Req() req: any) {
    await this.integrationsService.disconnect(
      req.user.organizationId,
      provider,
    );
    return { status: 'disconnected' };
  }
}
