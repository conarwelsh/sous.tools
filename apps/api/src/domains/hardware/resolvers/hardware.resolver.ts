import { Resolver, Query, Args } from '@nestjs/graphql';
import { HardwareService } from '../services/hardware.service.js';
import { ObjectType, Field, ID } from '@nestjs/graphql';

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
}

@Resolver(() => DeviceType)
export class HardwareResolver {
  constructor(private readonly hardwareService: HardwareService) {}

  @Query(() => [DeviceType])
  async devices(@Args('orgId') orgId: string) {
    // For MVP, we'll map the Drizzle results to the GraphQL type.
    // Note: hardwareService.getDevices(orgId) needs implementation.
    // I'll implement it in hardware.service.ts
    return this.hardwareService.getDevicesByOrg(orgId);
  }
}
