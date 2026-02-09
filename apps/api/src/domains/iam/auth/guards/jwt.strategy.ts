/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { configPromise } from '@sous/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: (_request: any, _rawJwtToken: any, done: any) => {
        configPromise
          .then((config) => {
            done(null, config.iam?.jwtSecret || 'sous-secret-key');
          })
          .catch((err) => done(err));
      },
    });
  }

  async validate(payload: any) {
    return {
      id: payload.sub,
      email: payload.email,
      organizationId: payload.orgId,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
