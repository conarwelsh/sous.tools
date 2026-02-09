import {
  Injectable,
  NotFoundException,
  OnModuleInit,
  Inject,
} from '@nestjs/common';
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
export class PresentationService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    @Inject(RealtimeGateway) private readonly realtimeGateway: RealtimeGateway,
  ) {}

  async seedSystem(orgId: string) {
    console.log('🌱 Seeding Presentation System Templates...');
    const systemTemplates = [
      {
        name: 'Fullscreen Content',
        structure: JSON.stringify({
          layout: 'fullscreen',
          slots: [{ id: 'main', type: 'any' }],
        }),
        isSystem: true,
        organizationId: orgId,
      },
      {
        name: 'Two Column Grid',
        structure: JSON.stringify({
          layout: 'grid-2',
          slots: [
            { id: 'left', type: 'any' },
            { id: 'right', type: 'any' },
          ],
        }),
        isSystem: true,
        organizationId: orgId,
      },
    ];

    for (const t of systemTemplates) {
      console.log('DEBUG: Inserting template:', t.name);
      await this.dbService.db.insert(templates).values(t).onConflictDoNothing();
      console.log('DEBUG: Template inserted.');
    }
  }

  async seedSample(orgId: string) {
    logger.info('  └─ Seeding Presentation Sample Data...');
    // Add sample displays if needed
    await this.dbService.db
      .insert(displays)
      .values({
        name: 'Main Entrance TV',
        organizationId: orgId,
      })
      .onConflictDoNothing();
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
