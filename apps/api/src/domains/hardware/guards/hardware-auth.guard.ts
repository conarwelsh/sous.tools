import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { DatabaseService } from '../../core/database/database.service.js';
import { eq, and } from 'drizzle-orm';
import { devices } from '../../core/database/schema.js';

@Injectable()
export class HardwareAuthGuard implements CanActivate {
  constructor(private readonly dbService: DatabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let request: any;
    
    if (context.getType<string>() === 'graphql') {
      const ctx = GqlExecutionContext.create(context);
      request = ctx.getContext().req;
    } else {
      request = context.switchToHttp().getRequest();
    }

    if (!request) return false;

    const hardwareId = request.headers['x-hardware-id'];
    const orgId = request.headers['x-organization-id'];

    if (!hardwareId || !orgId) {
      // Fallback to standard JWT if present
      return false; 
    }

    // Verify hardware belongs to org and is active
    const device = await this.dbService.readDb.query.devices.findFirst({
      where: and(
        eq(devices.hardwareId, hardwareId),
        eq(devices.organizationId, orgId),
        eq(devices.status, 'online')
      ),
    });

    if (!device) {
      throw new UnauthorizedException('Hardware not recognized or inactive');
    }

    // Populate user context for resolvers
    request['user'] = {
      id: `hw-${hardwareId}`,
      organizationId: orgId,
      isHardware: true,
    };

    return true;
  }
}
