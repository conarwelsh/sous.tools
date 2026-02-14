import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../../core/database/database.service.js';
import { organizations, plans, usageMetrics } from '../organizations.schema.js';
import { eq, and } from 'drizzle-orm';
import { FeatureScope, MetricKey, ROLE_SCOPES } from '@sous/features/constants/plans';
import { logger } from '@sous/logger';

@Injectable()
export class PlanService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

  async getEffectiveAccess(organizationId: string, role?: string) {
    const org = await this.dbService.db.query.organizations.findFirst({
      where: eq(organizations.id, organizationId),
      with: {
        plan: true,
      },
    });

    if (!org) throw new Error('Organization not found');

    const baseScopes = (org.plan?.baseScopes as FeatureScope[]) || [];
    const roleScopes = role ? (ROLE_SCOPES[role] || []) : [];
    
    const baseLimits = (org.plan?.limits as Record<MetricKey, number>) || {};

    const combinedScopes = new Set([...baseScopes, ...roleScopes, ...(org.scopeOverrides as FeatureScope[])]);
    const effectiveLimits = { ...baseLimits, ...(org.limitOverrides as Record<MetricKey, number>) };

    return {
      scopes: Array.from(combinedScopes),
      limits: effectiveLimits,
      status: org.planStatus,
      gracePeriodEndsAt: org.gracePeriodEndsAt,
    };
  }

  async checkLimit(organizationId: string, key: MetricKey): Promise<boolean> {
    const access = await this.getEffectiveAccess(organizationId);
    const limit = access.limits[key];

    if (limit === undefined || limit === -1) return true; // Unlimited

    const metric = await this.dbService.db.query.usageMetrics.findFirst({
      where: and(
        eq(usageMetrics.organizationId, organizationId),
        eq(usageMetrics.metricKey, key),
      ),
    });

    const currentCount = metric?.currentCount || 0;
    return currentCount < limit;
  }

  async incrementUsage(organizationId: string, key: MetricKey, amount = 1) {
    const metric = await this.dbService.db.query.usageMetrics.findFirst({
      where: and(
        eq(usageMetrics.organizationId, organizationId),
        eq(usageMetrics.metricKey, key),
      ),
    });

    if (metric) {
      await this.dbService.db
        .update(usageMetrics)
        .set({
          currentCount: metric.currentCount + amount,
          updatedAt: new Date(),
        })
        .where(eq(usageMetrics.id, metric.id));
    } else {
      await this.dbService.db.insert(usageMetrics).values({
        organizationId,
        metricKey: key,
        currentCount: amount,
      });
    }
  }
}
