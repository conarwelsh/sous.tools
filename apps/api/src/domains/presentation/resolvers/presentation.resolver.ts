import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  Subscription,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PresentationService } from '../services/presentation.service.js';
import { Inject } from '@nestjs/common';
import { PubSub } from 'graphql-subscriptions';

@ObjectType()
export class LayoutType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  structure: string;

  @Field()
  content: string;

  @Field({ nullable: true })
  config?: string;
}

@ObjectType()
export class PresentationDisplayType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  hardwareId?: string;

  @Field(() => LayoutType, { nullable: true })
  activeLayout?: LayoutType;
}

@Resolver(() => PresentationDisplayType)
export class PresentationDisplayResolver {
  constructor(private readonly presentationService: PresentationService) {}

  @ResolveField(() => LayoutType, { nullable: true })
  async activeLayout(@Parent() display: any) {
    if (!display.hardwareId) return null;
    return this.presentationService.getActiveLayoutByHardwareId(display.hardwareId);
  }
}

@Resolver()
export class PresentationResolver {
  constructor(
    private readonly presentationService: PresentationService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub,
  ) {}

  @Query(() => [LayoutType])
  async layouts(@Args('organizationId') orgId: string) {
    return this.presentationService.getLayouts(orgId);
  }

  @Query(() => [PresentationDisplayType])
  async displays(@Args('organizationId') orgId: string) {
    return this.presentationService.getDisplays(orgId);
  }

  @Query(() => LayoutType, { nullable: true })
  async layout(@Args('id') id: string, @Args('organizationId') orgId: string) {
    return this.presentationService.getLayoutById(id, orgId);
  }

  @Query(() => LayoutType, { nullable: true })
  async activeLayout(@Args('hardwareId') hardwareId: string) {
    console.log(`[PresentationResolver] activeLayout query received for hardwareId: ${hardwareId}`);
    return this.presentationService.getActiveLayoutByHardwareId(hardwareId);
  }

  @Subscription(() => LayoutType, {
    filter: (payload, variables) => {
      return payload.presentationUpdated.hardwareId === variables.hardwareId;
    },
    resolve: (payload) => payload.presentationUpdated.layout,
  })
  presentationUpdated(@Args('hardwareId') hardwareId: string) {
    return this.pubSub.asyncIterableIterator('presentationUpdated');
  }
}
