import {
  Resolver,
  Query,
  Args,
  ObjectType,
  Field,
  Float,
} from '@nestjs/graphql';
import { MetricsService } from './metrics.service.js';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../iam/auth/guards/jwt-auth.guard.js';

@ObjectType()
class MetricValue {
  @Field(() => Float)
  value: number;

  @Field({ nullable: true })
  unit?: string;
}

@ObjectType()
class DashboardMetrics {
  @Field(() => MetricValue)
  dailySales: MetricValue;

  @Field(() => MetricValue)
  recipesCount: MetricValue;

  @Field(() => MetricValue)
  ingredientsCount: MetricValue;

  @Field(() => MetricValue)
  pendingInvoicesCount: MetricValue;

  @Field(() => MetricValue)
  connectedNodesCount: MetricValue;
}

@Resolver()
export class MetricsResolver {
  constructor(private readonly metricsService: MetricsService) {}

  @Query(() => DashboardMetrics)
  async dashboardMetrics(@Args('orgId') orgId: string) {
    const [
      dailySales,
      recipesCount,
      ingredientsCount,
      pendingInvoicesCount,
      connectedNodesCount,
    ] = await Promise.all([
      this.metricsService.getDailySales(orgId),
      this.metricsService.getRecipesCount(orgId),
      this.metricsService.getIngredientsCount(orgId),
      this.metricsService.getPendingInvoicesCount(orgId),
      this.metricsService.getConnectedNodesCount(orgId),
    ]);

    return {
      dailySales,
      recipesCount,
      ingredientsCount,
      pendingInvoicesCount,
      connectedNodesCount,
    };
  }
}
