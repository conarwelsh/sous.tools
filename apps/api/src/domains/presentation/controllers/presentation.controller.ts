import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { PresentationService } from '../services/presentation.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('presentation')
@UseGuards(JwtAuthGuard)
export class PresentationController {
  constructor(private readonly presentationService: PresentationService) {}

  // --- Templates ---
  @Post('templates')
  async createTemplate(@Body() body: any, @Req() req: any) {
    return this.presentationService.createTemplate({
      ...body,
      organizationId: req.user.orgId,
    });
  }

  @Get('templates')
  async getTemplates(@Req() req: any) {
    return this.presentationService.getTemplates(req.user.orgId);
  }

  // --- Displays ---
  @Post('displays')
  async createDisplay(@Body() body: any, @Req() req: any) {
    return this.presentationService.createDisplay({
      ...body,
      organizationId: req.user.orgId,
    });
  }

  @Get('displays')
  async getDisplays(@Req() req: any) {
    return this.presentationService.getDisplays(req.user.orgId);
  }

  // --- Assignments ---
  @Post('assignments')
  async createAssignment(@Body() body: any, @Req() req: any) {
    // Basic validation: Verify display belongs to org
    const display = await this.presentationService.getDisplayById(
      body.displayId,
      req.user.orgId,
    );
    if (!display) throw new BadRequestException('Invalid Display ID');

    return this.presentationService.assignTemplateToDisplay({
      ...body,
      // We don't need orgId here as it's a join table, but we validated access above
    });
  }
}
