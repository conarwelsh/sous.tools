import { Resolver, Query, Args, Subscription } from '@nestjs/graphql';
import { HardwareService } from '../services/hardware.service.js';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@ObjectType()
class DeviceType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  type: string;

  @Field()
  status: string;

  @Field()
  hardwareId: string;

  @Field({ nullable: true })
  metadata?: string;

  @Field({ nullable: true })
  lastHeartbeat?: Date;

  @Field({ nullable: true })
  organizationId?: string;
}

@Resolver(() => DeviceType)
export class HardwareResolver {
  constructor(
    private readonly hardwareService: HardwareService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [DeviceType])
  async devices(@Args('orgId') orgId: string) {
    // For MVP, we'll map the Drizzle results to the GraphQL type.
    return this.hardwareService.getDevicesByOrg(orgId);
  }

  @Subscription(() => DeviceType, {
    filter: (payload, variables) => {
      // Only push updates for the organization the client is subscribed to
      return payload.deviceUpdated.organizationId === variables.orgId;
    },
  })
  deviceUpdated(@Args('orgId') orgId: string) {
    return this.pubSub.asyncIterableIterator('deviceUpdated');
  }
}
