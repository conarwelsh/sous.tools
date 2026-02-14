import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GqlAuthGuard } from '../../iam/auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator.js';
import { InventoryService } from '../services/inventory.service.js';
import { IngredientType } from '../../culinary/resolvers/culinary.resolver.js'; // Reuse type
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

@ObjectType()
export class StockLedgerEntry {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  ingredientId: string;

  @Field(() => Int)
  amount: number;

  @Field()
  type: string;

  @Field()
  createdAt: Date;
}

@Resolver()
@UseGuards(GqlAuthGuard)
export class InventoryResolver {
  constructor(private readonly inventoryService: InventoryService) {}

  @Query(() => [StockLedgerEntry])
  async stockLedger(
    @CurrentUser() user: any,
    @Args('locationId', { nullable: true }) locationId?: string
  ) {
    return this.inventoryService.getLedger(user.organizationId, locationId);
  }
}
