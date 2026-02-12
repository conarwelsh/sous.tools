import { Controller, Get, Param, NotFoundException, Req } from '@nestjs/common';
import { PresentationService } from '../services/presentation.service.js';
import { DatabaseService } from '../../core/database/database.service.js';
import { organizations } from '../../iam/organizations/organizations.schema.js';
import { eq } from 'drizzle-orm';

@Controller('public/presentation')
export class PublicPresentationController {
  constructor(
    private readonly presentationService: PresentationService,
    private readonly dbService: DatabaseService,
  ) {}

  @Get('signage/:slug')
  async getLayoutBySlug(@Param('slug') slug: string, @Req() req: any) {
    // Extract org slug from header (e.g. 'dtown-cafe')
    const orgSlug = req.headers['x-org-slug'];

    let orgId: string | undefined;
    if (orgSlug) {
      const org = await this.dbService.db.query.organizations.findFirst({
        where: eq(organizations.slug, orgSlug),
      });
      orgId = org?.id;
    }

    const layout = await this.presentationService.getLayoutBySlug(slug, orgId);
    if (!layout) throw new NotFoundException('Page not found');

    return {
      ...layout,
      structure: layout.structure ? JSON.parse(layout.structure) : null,
      content: layout.content ? JSON.parse(layout.content) : {},
      config: layout.config ? JSON.parse(layout.config) : {},
    };
  }
}
