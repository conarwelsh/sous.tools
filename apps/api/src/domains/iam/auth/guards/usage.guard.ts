import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { MetricKey } from '@sous/features/constants/plans';
import { PlanService } from '../../organizations/services/plan.service.js';

@Injectable()
export class UsageGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private planService: PlanService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const metricKey = this.reflector.get<MetricKey>(
      'metric_key',
      context.getHandler(),
    );

    if (!metricKey) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.organizationId) {
      return false;
    }

    const hasCapacity = await this.planService.checkLimit(
      user.organizationId,
      metricKey,
    );

    if (!hasCapacity) {
      throw new ForbiddenException(`Usage limit reached for ${metricKey}`);
    }

    return true;
  }
}
