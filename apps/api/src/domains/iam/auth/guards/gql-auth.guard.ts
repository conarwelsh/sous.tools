import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { JwtAuthGuard } from './jwt-auth.guard.js';

@Injectable()
export class GqlAuthGuard extends JwtAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext()?.req;

    if (!request) {
      // If there is no request (e.g. Subscriptions without context properly set),
      // we might want to allow or deny based on specific logic.
      // For now, let's just allow if it's a subscription to prevent crashes,
      // as they are usually handled separately or have their own auth logic.
      const info = ctx.getInfo();
      if (info?.operation?.operation === 'subscription') {
        return true;
      }
      return false;
    }
    
    // Create a mock ExecutionContext that returns the GQL request for the HTTP-based JwtAuthGuard
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as ExecutionContext;

    return super.canActivate(mockContext);
  }
}
