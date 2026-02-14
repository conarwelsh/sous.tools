import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../iam/auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator.js';
import { PosService } from '../services/pos.service.js';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class PosLedger {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  locationId: string;

  @Field(() => Int)
  startingCash: number;

  @Field()
  status: string;

  @Field()
  openedAt: Date;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class PosResolver {
  constructor(private readonly posService: PosService) {}

  @Query(() => PosLedger, { nullable: true })
  async openLedger(
    @CurrentUser() user: any,
    @Args('locationId') locationId: string
  ) {
    return this.posService.getOpenLedger(locationId);
  }
}
