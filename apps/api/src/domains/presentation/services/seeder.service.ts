import { Injectable, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { templates, organizations } from '../../core/database/schema.js';
import { eq } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class PresentationSeederService implements OnModuleInit {
  constructor(private readonly dbService: DatabaseService) {}

  async onModuleInit() {
    await this.seedSystemTemplates();
  }

  async seedSystemTemplates() {
    logger.info('🌱 Seeding system templates...');

    try {
      // Find or create a 'system' organization if needed, or just null out for system templates
      // For now, we'll use a placeholder UUID if organizationId is not null
      // Actually, our schema mandates organizationId. We should probably make it nullable for system templates or use a reserved ID.
      
      const systemOrg = await this.dbService.db.query.organizations.findFirst({
        where: eq(organizations.slug, 'system'),
      });

      let orgId: string;
      if (!systemOrg) {
        const result = await this.dbService.db.insert(organizations).values({
          name: 'System',
          slug: 'system',
        }).returning();
        orgId = result[0].id;
      } else {
        orgId = systemOrg.id;
      }

      const systemTemplates = [
        {
          name: 'Fullscreen Content',
          description: 'A single slot covering the entire screen.',
          structure: JSON.stringify({
            layout: 'fullscreen',
            slots: [{ id: 'main', type: 'any' }],
          }),
          isSystem: true,
          organizationId: orgId,
        },
        {
          name: 'Two Column Grid',
          description: 'Equal width columns for split content.',
          structure: JSON.stringify({
            layout: 'grid-2',
            slots: [{ id: 'left', type: 'any' }, { id: 'right', type: 'any' }],
          }),
          isSystem: true,
          organizationId: orgId,
        },
      ];

      for (const template of systemTemplates) {
        const existing = await this.dbService.db.query.templates.findFirst({
          where: eq(templates.name, template.name),
        });

        if (!existing) {
          await this.dbService.db.insert(templates).values(template);
          logger.info(`✅ Seeded template: ${template.name}`);
        }
      }
    } catch (error) {
      logger.error('❌ Failed to seed system templates', error as any);
    }
  }
}
