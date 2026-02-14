import { Controller, Get, Post, Body, Query, UseGuards, Req, Res, BadRequestException, Param, Delete } from '@nestjs/common';
import { OAuthService } from '../services/oauth.service.js';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard.js';
import { logger } from '@sous/logger';

@Controller('oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get('authorize')
  @UseGuards(JwtAuthGuard)
  async authorize(
    @Query('client_id') clientId: string,
    @Query('scope') scope: string,
    @Query('redirect_uri') redirectUri: string,
    @Req() req: any,
  ) {
    const client = await this.oauthService.getClient(clientId);
    
    const uris = client.redirectUris as string[];
    if (!uris.includes(redirectUri)) {
      throw new BadRequestException('Invalid redirect URI');
    }

    return {
      client: {
        name: client.name,
        clientId: client.clientId,
      },
      requestedScopes: scope.split(' '),
      redirectUri,
    };
  }

  @Post('approve')
  @UseGuards(JwtAuthGuard)
  async approve(
    @Body() body: { clientId: string; scopes: string[]; redirectUri: string },
    @Req() req: any,
  ) {
    const code = await this.oauthService.createAuthorizationCode(
      body.clientId,
      req.user.sub || req.user.id,
      body.scopes,
    );

    const url = new URL(body.redirectUri);
    url.searchParams.append('code', code);
    
    return { redirectUrl: url.toString() };
  }

  @Post('token')
  async token(
    @Body('client_id') clientId: string,
    @Body('client_secret') clientSecret: string,
    @Body('code') code: string,
    @Body('grant_type') grantType: string,
  ) {
    if (grantType !== 'authorization_code') {
      throw new BadRequestException('Unsupported grant type');
    }

    return this.oauthService.exchangeCodeForToken(clientId, clientSecret, code);
  }

  // --- Developer Management ---

  @Get('clients')
  @UseGuards(JwtAuthGuard)
  async getMyClients(@Req() req: any) {
    return this.oauthService.getClientsForOrganization(req.user.organizationId);
  }

  @Post('clients')
  @UseGuards(JwtAuthGuard)
  async registerClient(@Body() body: { name: string; redirectUris: string[] }, @Req() req: any) {
    return this.oauthService.registerClient(req.user.organizationId, body.name, body.redirectUris);
  }

  @Post('clients/:clientId/rotate-secret')
  @UseGuards(JwtAuthGuard)
  async rotateSecret(@Param('clientId') clientId: string, @Req() req: any) {
    return this.oauthService.rotateSecret(clientId, req.user.organizationId);
  }

  @Delete('clients/:clientId')
  @UseGuards(JwtAuthGuard)
  async deleteClient(@Param('clientId') clientId: string, @Req() req: any) {
    return this.oauthService.deleteClient(clientId, req.user.organizationId);
  }
}
