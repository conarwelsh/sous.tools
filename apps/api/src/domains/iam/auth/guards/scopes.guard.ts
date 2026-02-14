import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FeatureScope } from '@sous/features/constants/plans';
import { PlanService } from '../../organizations/services/plan.service.js';

@Injectable()
export class ScopesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private planService: PlanService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredScopes = this.reflector.getAllAndOverride<FeatureScope[]>(
      'scopes',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredScopes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.organizationId) {
      return false;
    }

    const access = await this.planService.getEffectiveAccess(
      user.organizationId,
      user.role,
    );

    // Calculate intersection with Token scopes if present
    let effectiveScopes = access.scopes;
    if (user.scopes && Array.isArray(user.scopes)) {
      effectiveScopes = effectiveScopes.filter((s) => user.scopes.includes(s));
    }

    const hasScope = requiredScopes.every((scope) =>
      effectiveScopes.includes(scope),
    );

    if (!hasScope) {
      throw new ForbiddenException('Insufficient plan or role permissions');
    }

    return true;
  }
}
