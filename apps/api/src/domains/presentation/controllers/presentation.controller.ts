import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
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

  // --- Screens ---
  @Post('screens')
  async createScreen(@Body() body: any, @Req() req: any) {
    return this.presentationService.createScreen({
      ...body,
      organizationId: req.user.orgId,
    });
  }

  @Patch('screens/:id')
  async updateScreen(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.presentationService.updateScreen(id, req.user.orgId, body);
  }

  @Get('screens')
  async getScreens(@Req() req: any) {
    return this.presentationService.getScreens(req.user.orgId);
  }

  @Get('screens/:id')
  async getScreenById(@Param('id') id: string, @Req() req: any) {
    return this.presentationService.getScreenById(id, req.user.orgId);
  }

  @Delete('screens/:id')
  async deleteScreen(@Param('id') id: string, @Req() req: any) {
    return this.presentationService.deleteScreen(id, req.user.orgId);
  }

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

  @Patch('templates/:id')
  async updateTemplate(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.presentationService.updateTemplate(id, req.user.orgId, body);
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string, @Req() req: any) {
    return this.presentationService.deleteTemplate(id, req.user.orgId);
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

    return this.presentationService.assignScreenToDisplay({
      ...body,
    });
  }
}
