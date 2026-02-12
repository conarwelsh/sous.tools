import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { IntelligenceService } from '../services/intelligence.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('intelligence')
@UseGuards(JwtAuthGuard)
export class IntelligenceController {
  constructor(private readonly intelligenceService: IntelligenceService) {}

  @Post('recalculate-cost')
  async recalculate(@Body() body: { recipeId: string }, @Req() req: any) {
    await this.intelligenceService.queueRecipeCosting(
      body.recipeId,
      req.user.organizationId,
    );
    return { status: 'queued' };
  }
}
