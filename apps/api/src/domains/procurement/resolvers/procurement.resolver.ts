import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  Int,
  InputType,
} from '@nestjs/graphql';
import { ProcurementService } from '../services/procurement.service.js';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';
import { IngredientType } from '../../culinary/resolvers/culinary.resolver.js';

@ObjectType()
export class SupplierType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => [Int], { nullable: true })
  deliveryDays?: number[];

  @Field({ nullable: true })
  cutoffTime?: string;

  @Field(() => Int, { nullable: true })
  minOrderValue?: number;
}

@InputType()
export class CreateSupplierInput {
  @Field()
  name: string;

  @Field({ nullable: true })
  contactEmail?: string;

  @Field({ nullable: true })
  contactPhone?: string;

  @Field({ nullable: true })
  address?: string;

  @Field(() => Int, { nullable: true })
  minOrderValue?: number;

  @Field(() => [Int], { nullable: true })
  deliveryDays?: number[];

  @Field({ nullable: true })
  cutoffTime?: string;
}

@ObjectType()
export class ShoppingListItemType {
  @Field(() => ID)
  id: string;

  @Field(() => IngredientType)
  ingredient: IngredientType;

  @Field(() => Int)
  quantity: number;

  @Field()
  unit: string;

  @Field(() => SupplierType, { nullable: true })
  preferredSupplier?: SupplierType;

  @Field()
  status: string;

  @Field()
  source: string;

  @Field()
  createdAt: string;
}

@ObjectType()
export class PurchaseOrderType {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  supplierId: string;

  @Field()
  status: string;

  @Field(() => Int)
  totalAmount: number;

  @Field()
  createdAt: string;
}

@InputType()
class AddToShoppingListInput {
  @Field(() => ID)
  ingredientId: string;

  @Field(() => Int)
  quantity: number;

  @Field()
  unit: string;
}

@InputType()
class UpdateShoppingListItemInput {
  @Field(() => Int, { nullable: true })
  quantity?: number;

  @Field(() => ID, { nullable: true })
  preferredSupplierId?: string;

  @Field({ nullable: true })
  status?: string;
}

@Resolver()
export class ProcurementResolver {
  constructor(private readonly procurementService: ProcurementService) {}

  @Query(() => [SupplierType])
  async suppliers(@Args('orgId') orgId: string) {
    return this.procurementService.getSuppliers(orgId);
  }

  @Query(() => [ShoppingListItemType])
  async shoppingList(@Args('orgId') orgId: string) {
    return this.procurementService.getShoppingList(orgId);
  }

  @Mutation(() => SupplierType)
  async createSupplier(
    @Args('orgId') orgId: string,
    @Args('input') input: CreateSupplierInput,
  ) {
    return this.procurementService.createSupplier({
      ...input,
      organizationId: orgId,
    });
  }

  @Mutation(() => [ShoppingListItemType])
  async addToShoppingList(
    @Args('orgId') orgId: string,
    @Args('input') input: AddToShoppingListInput,
  ) {
    return this.procurementService.addToShoppingList(
      orgId,
      input.ingredientId,
      input.quantity,
      input.unit,
    );
  }

  @Mutation(() => [ShoppingListItemType])
  async updateShoppingListItem(
    @Args('orgId') orgId: string,
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateShoppingListItemInput,
  ) {
    return this.procurementService.updateShoppingListItem(id, orgId, input);
  }

  @Mutation(() => PurchaseOrderType)
  async placeOrder(
    @Args('orgId') orgId: string,
    @Args('supplierId', { type: () => ID }) supplierId: string,
    @Args('itemIds', { type: () => [ID] }) itemIds: string[],
  ) {
    return this.procurementService.placeOrder(orgId, supplierId, itemIds);
  }
}
