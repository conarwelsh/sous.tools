import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { SessionService } from '../services/session.service.js';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';
import { HardwareAuthGuard } from '../../hardware/guards/hardware-auth.guard.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private sessionService: SessionService,
    private reflector: Reflector,
    private hardwareGuard: HardwareAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    // Try hardware auth first
    try {
      const isHardware = await this.hardwareGuard.canActivate(context);
      if (isHardware) return true;
    } catch (e) {
      // Hardware auth failed, continue to JWT
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      // Check if token is revoked
      if (
        payload.jti &&
        (await this.sessionService.isTokenRevoked(payload.jti))
      ) {
        throw new UnauthorizedException('Token revoked');
      }

      // Assigning the mapped payload to the request object here
      // so that we can access it in our route handlers with consistent naming
      request['user'] = {
        ...payload,
        id: payload.sub,
        organizationId: payload.orgId,
      };
    } catch {
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    if (!request?.headers?.authorization) return undefined;
    const [type, token] = request.headers.authorization.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
