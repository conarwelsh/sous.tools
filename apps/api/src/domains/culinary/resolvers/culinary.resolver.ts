import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  Int,
} from '@nestjs/graphql';
import { Inject, forwardRef } from '@nestjs/common';
import { CulinaryService } from '../services/culinary.service.js';
import { IngestionService } from '../../ingestion/services/ingestion.service.js';
import { IntegrationsService } from '../../integrations/services/integrations.service.js';

@ObjectType()
export class IngredientType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field()
  baseUnit: string;

  @Field(() => Int, { nullable: true })
  currentPrice?: number;

  @Field({ nullable: true })
  lastPurchasedAt?: string;
}

@ObjectType()
export class RecipeIngredientType {
  @Field(() => ID)
  id: string;

  @Field(() => IngredientType)
  ingredient: IngredientType;

  @Field(() => Int)
  amount: number;

  @Field()
  unit: string;

  @Field(() => Int)
  wastageFactor: number;
}

@ObjectType()
export class RecipeStepType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  order: number;

  @Field()
  instruction: string;

  @Field(() => Int, { nullable: true })
  timerDuration?: number;
}

@ObjectType()
export class RecipeType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int, { nullable: true })
  yieldAmount?: number;

  @Field({ nullable: true })
  yieldUnit?: string;

  @Field({ nullable: true })
  sourceType?: string;

  @Field({ nullable: true })
  sourceId?: string;

  @Field({ nullable: true })
  sourceUrl?: string;

  @Field(() => [RecipeIngredientType])
  ingredients: RecipeIngredientType[];

  @Field(() => [RecipeStepType])
  steps: RecipeStepType[];
}

import { InputType } from '@nestjs/graphql';

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

  @Field(() => Int, { nullable: true })
  yieldAmount?: number;

  @Field({ nullable: true })
  yieldUnit?: string;
}

@Resolver()
export class CulinaryResolver {
  constructor(
    private readonly culinaryService: CulinaryService,
    private readonly ingestionService: IngestionService,
    @Inject(forwardRef(() => IntegrationsService))
    private readonly integrationsService: IntegrationsService,
  ) {}

  @Query(() => [IngredientType])
  async ingredients(@Args('orgId') orgId: string) {
    return this.culinaryService.getIngredients(orgId);
  }

  @Query(() => [RecipeType])
  async recipes(@Args('orgId') orgId: string) {
    return this.culinaryService.getRecipes(orgId);
  }

  @Query(() => RecipeType, { nullable: true })
  async recipe(@Args('id') id: string, @Args('orgId') orgId: string) {
    return this.culinaryService.getRecipe(id, orgId);
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
    return this.culinaryService.createRecipe(
      { ...input, organizationId: orgId },
      [],
    );
  }

  @Mutation(() => Boolean)
  async triggerRecipeAiIngestion(
    @Args('recipeId') recipeId: string,
    @Args('orgId') orgId: string,
  ) {
    const recipe = await this.culinaryService.getRecipe(recipeId, orgId);
    if (!recipe || !recipe.sourceType || !recipe.sourceId) {
      throw new Error('Recipe source not found');
    }

    const driver = await this.integrationsService.getStorageDriver(
      orgId,
      recipe.sourceType,
    );
    const result = await this.ingestionService.processGoogleDriveRecipe(
      recipeId,
      orgId,
      driver,
    );

    return !!result.success || true;
  }
}
