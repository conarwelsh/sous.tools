import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../iam/auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator.js';
import { IntegrationsService } from '../services/integrations.service.js';
import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class IntegrationConfig {
  @Field(() => ID)
  id: string;

  @Field()
  provider: string;

  @Field({ nullable: true })
  lastSyncedAt?: Date;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class IntegrationsResolver {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Query(() => [IntegrationConfig])
  async integrations(@CurrentUser() user: any) {
    return this.integrationsService.getIntegrations(user.organizationId);
  }
}
