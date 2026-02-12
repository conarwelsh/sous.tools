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
  Query,
} from '@nestjs/common';
import { PresentationService } from '../services/presentation.service.js';
import { JwtAuthGuard } from '../../iam/auth/guards/jwt-auth.guard.js';

@Controller('presentation')
@UseGuards(JwtAuthGuard)
export class PresentationController {
  constructor(private readonly presentationService: PresentationService) {}

  // --- Layouts (Polymorphic) ---

  @Post('layouts')
  async createLayout(@Body() body: any, @Req() req: any) {
    const { id, ...layoutData } = body;
    const finalData = {
      ...layoutData,
      organizationId: req.user.organizationId,
    };

    if (id && id !== 'new') {
      finalData.id = id;
    }

    return this.presentationService.createLayout(finalData);
  }

  @Patch('layouts/:id')
  async updateLayout(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.presentationService.updateLayout(
      id,
      req.user.organizationId,
      body,
    );
  }

  @Get('layouts')
  async getLayouts(@Query('type') type: string, @Req() req: any) {
    return this.presentationService.getLayouts(req.user.organizationId, type);
  }

  @Get('layouts/:id')
  async getLayoutById(@Param('id') id: string, @Req() req: any) {
    return this.presentationService.getLayoutById(id, req.user.organizationId);
  }

  @Delete('layouts/:id')
  async deleteLayout(@Param('id') id: string, @Req() req: any) {
    return this.presentationService.deleteLayout(id, req.user.organizationId);
  }

  // --- Legacy / Specific Helper Endpoints ---

  @Get('templates')
  async getTemplates(@Req() req: any) {
    return this.presentationService.getTemplates(req.user.organizationId);
  }

  @Get('signage')
  async getSignage(@Req() req: any) {
    return this.presentationService.getLayouts(
      req.user.organizationId,
      'SCREEN',
    );
  }

  @Get('pages')
  async getPages(@Req() req: any) {
    return this.presentationService.getLayouts(req.user.organizationId, 'PAGE');
  }

  @Get('labels')
  async getLabels(@Req() req: any) {
    return this.presentationService.getLayouts(
      req.user.organizationId,
      'LABEL',
    );
  }

  // --- Displays ---
  @Post('displays')
  async createDisplay(@Body() body: any, @Req() req: any) {
    return this.presentationService.createDisplay({
      ...body,
      organizationId: req.user.organizationId,
    });
  }

  @Get('displays')
  async getDisplays(@Req() req: any) {
    return this.presentationService.getDisplays(req.user.organizationId);
  }

  // --- Assignments ---
  @Post('assignments')
  async createAssignment(@Body() body: any, @Req() req: any) {
    const display = await this.presentationService.getDisplayById(
      body.displayId,
      req.user.organizationId,
    );
    if (!display) throw new BadRequestException('Invalid Display ID');

    return this.presentationService.assignLayoutToDisplay({
      ...body,
    });
  }
}
