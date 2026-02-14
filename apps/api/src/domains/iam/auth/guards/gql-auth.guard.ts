import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Injectable()
export class GqlAuthGuard extends JwtAuthGuard {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = this.getRequest(context);
    if (!request) {
      const ctx = GqlExecutionContext.create(context);
      const info = ctx.getInfo();
      if (info?.operation?.operation === 'subscription') {
        return true;
      }
      return false;
    }

    return super.canActivate(context);
  }
}
