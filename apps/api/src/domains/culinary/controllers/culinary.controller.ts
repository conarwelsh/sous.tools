import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
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
  async getRecipes(@Req() req: any) {
    return this.culinaryService.getRecipes(req.user.organizationId);
  }

  @Post('recipes')
  async createRecipe(@Body() body: any, @Req() req: any) {
    const { ingredients, ...recipeData } = body;
    return this.culinaryService.createRecipe(
      { ...recipeData, organizationId: req.user.organizationId },
      ingredients || []
    );
  }
}
