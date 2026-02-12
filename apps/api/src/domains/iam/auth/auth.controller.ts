import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Patch,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { SessionService } from './services/session.service.js';
import { config } from '@sous/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    return this.authService.register(body);
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: any) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const user = req.user;
    if (user.jti && user.exp) {
      await this.sessionService.revokeToken(user.jti, user.exp);
    }
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Patch('change-password')
  async changePassword(@Body() body: any, @Req() req: any) {
    return this.authService.changePassword(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    const userId = req.user.sub || req.user.id;
    const user = await this.authService.getProfile(userId);
    if (!user) throw new UnauthorizedException('User not found');
    return user;
  }

  // --- Google Auth ---
  @Get('google-login')
  async googleLogin(@Res() res: any) {
    const { clientId, redirectUri } = config.google;
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';

    const scopes = [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const url = new URL(baseUrl);
    url.searchParams.append('client_id', clientId || '');
    url.searchParams.append(
      'redirect_uri',
      redirectUri || `${config.api.url}/auth/google-callback`,
    );
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scopes);
    url.searchParams.append('prompt', 'consent');

    return res.redirect(url.toString());
  }

  @Get('google-callback')
  async googleCallback(@Query('code') code: string, @Res() res: any) {
    const { clientId, clientSecret, redirectUri } = config.google;

    // 1. Exchange code for token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId || '',
        client_secret: clientSecret || '',
        redirect_uri: redirectUri || `${config.api.url}/auth/google-callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new UnauthorizedException('Google OAuth failed');

    // 2. Get user info
    const userRes = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      },
    );
    const userData = await userRes.json();

    try {
      const user = await this.authService.validateGoogleUser({
        id: userData.id,
        email: userData.email,
        firstName: userData.given_name,
        lastName: userData.family_name,
      });

      const { access_token } = await this.authService.login(user);
      return res.redirect(`${config.web.url}/login?token=${access_token}`);
    } catch (e: any) {
      return res.redirect(
        `${config.web.url}/login?error=${encodeURIComponent(e.message)}`,
      );
    }
  }
}
