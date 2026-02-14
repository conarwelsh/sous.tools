/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { config } from '@sous/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.iam?.jwtSecret || 'sous-secret-key',
    });
  }

  async validate(payload: any) {
    const user = {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.orgId,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
    return user;
  }
}
