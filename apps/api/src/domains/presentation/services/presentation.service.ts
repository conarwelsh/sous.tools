import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  templates,
  displays,
  displayAssignments,
  organizations,
} from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { RealtimeGateway } from '../../realtime/realtime.gateway.js';

@Injectable()
export class PresentationService implements OnModuleInit {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async onModuleInit() {
    await this.seedSystemTemplates();
  }

  private async seedSystemTemplates() {
    // We need a platform-level organization or just a null org for system templates.
    // For now, we'll just check if any system templates exist.
    const existing = await this.dbService.db
      .select()
      .from(templates)
      .where(eq(templates.isSystem, true))
      .limit(1);

    if (existing.length === 0) {
      logger.info('🌱 Seeding system presentation templates...');

      // Find or create a 'system' organization
      let systemOrg = await this.dbService.db
        .select()
        .from(organizations)
        .where(eq(organizations.slug, 'system'))
        .limit(1);

      if (systemOrg.length === 0) {
        const result = await this.dbService.db
          .insert(organizations)
          .values({
            name: 'System',
            slug: 'system',
          })
          .returning();
        systemOrg = [result[0]];
      }

      await this.dbService.db.insert(templates).values([
        {
          organizationId: systemOrg[0].id,
          name: 'Fullscreen Single',
          description: 'A single fullscreen content slot.',
          isSystem: true,
          structure: JSON.stringify({
            layout: 'fullscreen',
            config: {},
            slots: [{ id: 'main', name: 'Main Content', type: 'image' }],
          }),
        },
        {
          organizationId: systemOrg[0].id,
          name: 'Two Column Grid',
          description: 'Side-by-side content slots.',
          isSystem: true,
          structure: JSON.stringify({
            layout: 'grid',
            config: { columns: 2 },
            slots: [
              { id: 'left', name: 'Left Column', type: 'image' },
              { id: 'right', name: 'Right Column', type: 'menu_list' },
            ],
          }),
        },
      ]);

      logger.info('✅ System templates seeded');
    }
  }

  // --- Templates ---
  async createTemplate(data: typeof templates.$inferInsert) {
    const result = await this.dbService.db
      .insert(templates)
      .values(data)
      .returning();
    return result[0];
  }

  async getTemplates(organizationId: string) {
    return this.dbService.db
      .select()
      .from(templates)
      .where(eq(templates.organizationId, organizationId));
  }

  async getTemplateById(id: string, organizationId: string) {
    const result = await this.dbService.db
      .select()
      .from(templates)
      .where(
        and(eq(templates.id, id), eq(templates.organizationId, organizationId)),
      );
    return result[0];
  }

  // --- Displays ---
  async createDisplay(data: typeof displays.$inferInsert) {
    const result = await this.dbService.db
      .insert(displays)
      .values(data)
      .returning();
    return result[0];
  }

  async getDisplays(organizationId: string) {
    return this.dbService.db
      .select()
      .from(displays)
      .where(eq(displays.organizationId, organizationId));
  }

  async getDisplayById(id: string, organizationId: string) {
    const result = await this.dbService.db
      .select()
      .from(displays)
      .where(
        and(eq(displays.id, id), eq(displays.organizationId, organizationId)),
      );
    return result[0];
  }

  // --- Assignments ---
  async assignTemplateToDisplay(data: typeof displayAssignments.$inferInsert) {
    // 1. Validate Ownership (Ensure Display belongs to Org - basic check)
    // In a real app, we'd do a join or separate check. Relying on strict Drizzle insert for now.

    const result = await this.dbService.db
      .insert(displayAssignments)
      .values(data)
      .returning();

    // Trigger Real-time Update
    // We need to fetch the organizationId to emit to the correct room.
    // Ideally, we'd have it from the display lookup, but for now we assume the gateway handles routing or we fetch it.
    // For MVP, we'll just emit to the org if we had it, but `displayAssignments` doesn't strictly have orgId (displays does).
    // Let's fetch the display to get the orgId.

    const display = await this.dbService.db
      .select()
      .from(displays)
      .where(eq(displays.id, data.displayId))
      .limit(1);

    if (display && display[0]) {
      this.realtimeGateway.emitToOrg(
        display[0].organizationId,
        'presentation:update',
        {
          displayId: data.displayId,
          assignment: result[0],
        },
      );
    }

    return result[0];
  }

  async getAssignmentsForDisplay(displayId: string) {
    return this.dbService.db
      .select()
      .from(displayAssignments)
      .where(eq(displayAssignments.displayId, displayId));
  }
}
