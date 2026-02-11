import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TagsService } from '../services/tags.service.js';
import { JwtAuthGuard } from '../../../iam/auth/guards/jwt-auth.guard.js';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Get()
  async getTags(@Req() req: any, @Query('entityType') entityType?: string) {
    return this.tagsService.getTags(req.user.organizationId, entityType);
  }

  @Post()
  async createTag(@Body() body: any, @Req() req: any) {
    return this.tagsService.createTag({
      ...body,
      organizationId: req.user.organizationId,
    });
  }

  @Put(':id')
  async updateTag(@Param('id') id: string, @Body() body: any) {
    return this.tagsService.updateTag(id, body);
  }

  @Delete(':id')
  async deleteTag(@Param('id') id: string) {
    return this.tagsService.deleteTag(id);
  }

  @Get('assignments/:entityType/:entityId')
  async getAssignments(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.tagsService.getAssignments(entityType, entityId);
  }

  @Post('assignments/:entityType/:entityId')
  async assignTags(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
    @Body('tagIds') tagIds: string[],
  ) {
    return this.tagsService.assignTags(entityType, entityId, tagIds);
  }
}
