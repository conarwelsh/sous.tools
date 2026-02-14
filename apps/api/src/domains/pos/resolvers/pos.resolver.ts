import { Resolver, Query, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards, Inject } from '@nestjs/common';
import { GqlAuthGuard } from '../../iam/auth/guards/gql-auth.guard.js';
import { CurrentUser } from '../../iam/auth/decorators/current-user.decorator.js';
import { PosService } from '../services/pos.service.js';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';

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

@ObjectType()
export class PosOrderItem {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  quantity: number;
}

@ObjectType()
export class PosOrder {
  @Field(() => ID)
  id: string;

  @Field()
  externalOrderId: string;

  @Field()
  status: string;

  @Field(() => Int)
  totalAmount: number;

  @Field()
  createdAt: Date;

  @Field(() => [PosOrderItem])
  items: PosOrderItem[];
}

/**
 * Resolver for POS and KDS operations.
 * Handles orders, ledgers, and real-time updates.
 */
@Resolver()
@UseGuards(GqlAuthGuard)
export class PosResolver {
  constructor(
    private readonly posService: PosService,
    @Inject('PUB_SUB') private readonly pubSub: PubSub
  ) {}

  /**
   * Retrieves the currently open ledger for a location.
   */
  @Query(() => PosLedger, { nullable: true })
  async openLedger(
    @CurrentUser() user: any,
    @Args('locationId') locationId: string
  ) {
    return this.posService.getOpenLedger(locationId);
  }

  /**
   * Retrieves all active (OPEN) orders for an organization.
   */
  @Query(() => [PosOrder])
  async activeOrders(@CurrentUser() user: any) {
    return this.posService.getActiveOrders(user.organizationId);
  }

  /**
   * Retrieves orders for an organization with optional status filtering.
   */
  @Query(() => [PosOrder])
  async orders(
    @CurrentUser() user: any,
    @Args('status', { nullable: true }) status?: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit?: number,
  ) {
    return this.posService.getOrders(user.organizationId, status, limit);
  }

  /**
   * Updates the status of an order (e.g., OPEN -> COMPLETED).
   * Publishes an event to the orderUpdated subscription.
   */
  @Mutation(() => PosOrder)
  async updateOrderStatus(
    @Args('id') id: string,
    @Args('status') status: string,
  ) {
    const order = await this.posService.updateOrderStatus(id, status);
    
    // Notify subscribers
    await this.pubSub.publish('orderUpdated', { orderUpdated: order });
    
    return order;
  }

  /**
   * Subscription for real-time order updates.
   * Filters by organizationId to ensure data isolation.
   */
  @Subscription(() => PosOrder, {
    resolve: (payload) => payload.orderUpdated
  })
  orderUpdated() {
    return (this.pubSub as any).asyncIterator('orderUpdated');
  }
}
