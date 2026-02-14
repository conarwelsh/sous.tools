import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../iam/auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator.js';
import { BillingService } from '../services/billing.service.js';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class BillingPlan {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  slug: string;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class BillingResolver {
  constructor(private readonly billingService: BillingService) {}

  @Query(() => [BillingPlan])
  async billingPlans() {
    return this.billingService.getPlans();
  }
}
