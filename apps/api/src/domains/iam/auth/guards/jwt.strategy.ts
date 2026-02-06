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
      secretOrKeyProvider: async (_request: any, _rawJwtToken: any, done: any) => {
        const config = await configPromise;
        done(null, config.iam?.jwtSecret || 'sous-secret-key');
      },
    });
  }

  async validate(payload: any) {
    return { 
      id: payload.sub, 
      email: payload.email, 
      organizationId: payload.orgId, 
      role: payload.role 
    };
  }
}
