import {
  Resolver,
  Query,
  Mutation,
  Args,
  ObjectType,
  Field,
  ID,
  Int,
  Context,
} from '@nestjs/graphql';
import { Inject, forwardRef, Optional } from '@nestjs/common';
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
export class CategoryType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;

  @Field(() => Int)
  sortOrder: number;
}

@ObjectType()
export class ProductType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => Int)
  price: number;

  @Field({ nullable: true })
  categoryId?: string;

  @Field(() => Int)
  sortOrder: number;

  @Field()
  isSoldOut: boolean;
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
export class CookNoteType {
  @Field(() => ID)
  id: string;

  @Field()
  note: string;

  @Field()
  createdAt: string;

  @Field(() => UserType)
  user: any;
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

  @Field(() => [CookNoteType])
  notes: CookNoteType[];
}

import { InputType } from '@nestjs/graphql';
import { UserType } from '../../iam/users/resolvers/users.resolver.js';

@InputType()
export class AddCookNoteInput {
  @Field()
  recipeId: string;

  @Field()
  note: string;
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

  @Field(() => Int, { nullable: true })
  yieldAmount?: number;

  @Field({ nullable: true })
  yieldUnit?: string;
}

@InputType()
export class RecipeIngredientInput {
  @Field()
  ingredientId: string;

  @Field(() => Int)
  amount: number;

  @Field()
  unit: string;
}

@InputType()
export class RecipeStepInput {
  @Field(() => Int)
  order: number;

  @Field()
  instruction: string;

  @Field(() => Int, { nullable: true })
  timerDuration?: number;
}

@InputType()
export class UpdateRecipeInput {
  @Field({ nullable: true })
  name?: string;

  @Field(() => Int, { nullable: true })
  yieldAmount?: number;

  @Field({ nullable: true })
  yieldUnit?: string;

  @Field(() => [RecipeIngredientInput], { nullable: true })
  ingredients?: RecipeIngredientInput[];

  @Field(() => [RecipeStepInput], { nullable: true })
  steps?: RecipeStepInput[];
}

@Resolver(() => RecipeType)
export class CulinaryResolver {
  constructor(
    private readonly culinaryService: CulinaryService,
    @Optional() private readonly ingestionService: IngestionService,
    @Inject(forwardRef(() => IntegrationsService))
    private readonly integrationsService: IntegrationsService,
  ) {}

  @Query(() => [IngredientType])
  async ingredients(@Args('orgId') orgId: string) {
    return this.culinaryService.getIngredients(orgId);
  }

  @Query(() => [CategoryType])
  async categories(@Args('orgId') orgId: string) {
    return this.culinaryService.getCategories(orgId);
  }

  @Query(() => [ProductType])
  async products(
    @Args('orgId') orgId: string,
    @Args('categoryId', { nullable: true }) categoryId?: string,
  ) {
    return this.culinaryService.getProducts(orgId, categoryId);
  }

  @Query(() => [RecipeType])
  async recipes(
    @Args('orgId') orgId: string,
    @Args('search', { nullable: true }) search?: string,
    @Args('source', { nullable: true }) source?: string,
    @Args('tags', { type: () => [String], nullable: true }) tags?: string[],
  ) {
    return this.culinaryService.getRecipes(orgId, { search, source, tags });
  }

  @Query(() => RecipeType, { nullable: true })
  async recipe(@Args('id') id: string, @Args('orgId') orgId: string) {
    const recipe = await this.culinaryService.getRecipe(id, orgId);
    if (!recipe) return null;

    const notes = await this.culinaryService.getCookNotes(id);
    return { ...recipe, notes };
  }

  @Mutation(() => CookNoteType)
  async addCookNote(
    @Args('input') input: AddCookNoteInput,
    @Context() context: any,
  ) {
    const userId =
      context.req?.user?.id || '4c36d045-3c8c-48e5-9d59-849e2b58e427';

    return this.culinaryService.addCookNote({
      recipeId: input.recipeId,
      note: input.note,
      userId,
    });
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

  @Mutation(() => RecipeType)
  async updateRecipe(
    @Args('orgId') orgId: string,
    @Args('id') id: string,
    @Args('input') input: UpdateRecipeInput,
  ) {
    const { ingredients, steps, ...data } = input;
    return this.culinaryService.updateRecipe(
      id,
      orgId,
      data,
      ingredients as any,
      steps as any,
    );
  }

  @Mutation(() => RecipeType, { nullable: true })
  async deleteRecipe(@Args('orgId') orgId: string, @Args('id') id: string) {
    return this.culinaryService.deleteRecipe(id, orgId);
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
