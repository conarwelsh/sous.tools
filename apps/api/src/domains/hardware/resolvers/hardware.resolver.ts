import {
  Resolver,
  Query,
  Args,
  Subscription,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { HardwareService } from '../services/hardware.service.js';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';
import { DatabaseService } from '../../core/database/database.service.js';
import { eq } from 'drizzle-orm';
import {
  displays,
  displayAssignments,
  layouts,
} from '../../core/database/schema.js';

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

  @Field({ nullable: true })
  currentAssignment?: string;
}

@Resolver(() => DeviceType)
export class HardwareResolver {
  constructor(
    private readonly hardwareService: HardwareService,
    private readonly dbService: DatabaseService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [DeviceType])
  async devices(@Args('orgId') orgId: string) {
    return this.hardwareService.getDevicesByOrg(orgId);
  }

  @ResolveField(() => String, { nullable: true })
  async currentAssignment(@Parent() device: any) {
    const display = await this.dbService.readDb.query.displays.findFirst({
      where: eq(displays.hardwareId, device.hardwareId),
    });

    if (!display) return null;

    const assignment =
      await this.dbService.readDb.query.displayAssignments.findFirst({
        where: eq(displayAssignments.displayId, display.id),
        with: {
          layout: true,
        },
      });

    return assignment?.layout?.name || null;
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

  @Subscription(() => DeviceType, {
    filter: (payload, variables) => {
      return payload.devicePaired.hardwareId === variables.hardwareId;
    },
    resolve: (payload) => payload.devicePaired,
  })
  devicePaired(@Args('hardwareId') hardwareId: string) {
    return this.pubSub.asyncIterableIterator('devicePaired');
  }
}
