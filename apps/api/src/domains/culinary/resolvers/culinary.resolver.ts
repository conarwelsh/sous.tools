import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  Int,
  Float,
  InputType,
} from '@nestjs/graphql';
import { CulinaryService } from '../services/culinary.service.js';

@ObjectType()
export class IngredientType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  baseUnit: string;

  @Field(() => Int, { nullable: true })
  currentPrice?: number;
}

@ObjectType()
export class RecipeType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Float)
  yieldAmount: number;

  @Field()
  yieldUnit: string;
}

@InputType()
export class CreateIngredientInput {
  @Field()
  name: string;

  @Field()
  baseUnit: string;

  @Field(() => Int, { nullable: true })
  currentPrice?: number;
}

@InputType()
export class CreateRecipeInput {
  @Field()
  name: string;

  @Field(() => Float)
  yieldAmount: number;

  @Field()
  yieldUnit: string;
}

@Resolver()
export class CulinaryResolver {
  constructor(private readonly culinaryService: CulinaryService) {}

  @Query(() => [IngredientType])
  async ingredients(@Args('orgId') orgId: string) {
    return this.culinaryService.getIngredients(orgId);
  }

  @Query(() => [RecipeType])
  async recipes(@Args('orgId') orgId: string) {
    return this.culinaryService.getRecipes(orgId);
  }

  @Mutation(() => IngredientType)
  async createIngredient(
    @Args('orgId') orgId: string,
    @Args('input') input: CreateIngredientInput,
  ) {
    return this.culinaryService.createIngredient({
      ...input,
      organizationId: orgId,
    });
  }

  @Mutation(() => RecipeType)
  async createRecipe(
    @Args('orgId') orgId: string,
    @Args('input') input: CreateRecipeInput,
  ) {
    // For simplicity, not handling ingredients list in this mutation yet
    return this.culinaryService.createRecipe(
      { ...input, organizationId: orgId },
      [],
    );
  }
}
