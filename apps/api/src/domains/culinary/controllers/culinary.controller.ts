import { Controller, Get, Post, Patch, Delete, Body, Req, UseGuards, Query, Param } from '@nestjs/common';
import { CulinaryService } from '../services/culinary.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('culinary')
@UseGuards(JwtAuthGuard)
export class CulinaryController {
  constructor(private readonly culinaryService: CulinaryService) {}

  @Get('ingredients')
  async getIngredients(@Req() req: any) {
    return this.culinaryService.getIngredients(req.user.organizationId);
  }

  @Post('ingredients')
  async createIngredient(@Body() body: any, @Req() req: any) {
    return this.culinaryService.createIngredient({
      ...body,
      organizationId: req.user.organizationId,
    });
  }

  @Get('recipes')
  async getRecipes(
    @Req() req: any,
    @Query('search') search?: string,
    @Query('source') source?: string,
    @Query('tags') tags?: string,
  ) {
    const tagList = tags ? tags.split(',') : undefined;
    return this.culinaryService.getRecipes(req.user.organizationId, { search, source, tags: tagList });
  }

  @Post('recipes')
  async createRecipe(@Body() body: any, @Req() req: any) {
    const { ingredients, ...recipeData } = body;
    return this.culinaryService.createRecipe(
      { ...recipeData, organizationId: req.user.organizationId },
      ingredients || [],
    );
  }

  @Patch('recipes/:id')
  async updateRecipe(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const { ingredients, steps, ...recipeData } = body;
    return this.culinaryService.updateRecipe(
      id,
      req.user.organizationId,
      recipeData,
      ingredients,
      steps,
    );
  }

  @Delete('recipes/:id')
  async deleteRecipe(@Param('id') id: string, @Req() req: any) {
    return this.culinaryService.deleteRecipe(id, req.user.organizationId);
  }

  // --- Catalog ---
  @Get('categories')
  async getCategories(@Req() req: any) {
    return this.culinaryService.getCategories(req.user.organizationId);
  }

  @Post('categories')
  async createCategory(@Body() body: any, @Req() req: any) {
    return this.culinaryService.createCategory({
      ...body,
      organizationId: req.user.organizationId,
    });
  }

  @Get('products')
  async getProducts(@Req() req: any) {
    return this.culinaryService.getProducts(req.user.organizationId);
  }

  @Post('products')
  async createProduct(@Body() body: any, @Req() req: any) {
    return this.culinaryService.createProduct({
      ...body,
      organizationId: req.user.organizationId,
    });
  }
}
