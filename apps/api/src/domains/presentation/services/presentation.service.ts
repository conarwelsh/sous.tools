import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  templates,
  displays,
  displayAssignments,
  organizations,
  screens,
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

  // --- Screens ---
  async createScreen(data: typeof screens.$inferInsert) {
    const result = await this.dbService.db
      .insert(screens)
      .values(data)
      .returning();
    return result[0];
  }

  async updateScreen(
    id: string,
    organizationId: string,
    data: Partial<typeof screens.$inferInsert> & { assignments?: any },
  ) {
    const { assignments, ...screenData } = data;

    const result = await this.dbService.db
      .update(screens)
      .set({ ...screenData, updatedAt: new Date() })
      .where(
        and(eq(screens.id, id), eq(screens.organizationId, organizationId)),
      )
      .returning();

    if (!result[0]) throw new NotFoundException('Screen not found');

    const updatedScreen = result[0];

    // Handle Display Assignments if provided
    if (assignments?.hardware && Array.isArray(assignments.hardware)) {
      for (const displayId of assignments.hardware) {
        // Upsert assignment for this display
        await this.dbService.db
          .insert(displayAssignments)
          .values({
            displayId,
            screenId: id,
          })
          .onConflictDoUpdate({
            target: [displayAssignments.displayId],
            set: { screenId: id, updatedAt: new Date() },
          });

        // Trigger Real-time update for the display
        const display = await this.dbService.db.query.displays.findFirst({
          where: eq(displays.id, displayId),
        });

        if (display?.hardwareId) {
          // We need the layout structure too
          const layout = await this.dbService.db.query.templates.findFirst({
            where: eq(templates.id, updatedScreen.layoutId),
          });

          if (layout) {
            this.realtimeGateway.emitToHardware(
              display.hardwareId,
              'presentation:update',
              {
                screenId: id,
                structure: JSON.parse(layout.structure),
                slots: JSON.parse(updatedScreen.slots),
                customCss: updatedScreen.customCss,
              },
            );
          }
        }
      }
    }

    return updatedScreen;
  }

  async deleteScreen(id: string, organizationId: string) {
    await this.dbService.db
      .delete(screens)
      .where(
        and(eq(screens.id, id), eq(screens.organizationId, organizationId)),
      );
    return { success: true };
  }

  async getScreens(organizationId: string) {
    return this.dbService.db
      .select()
      .from(screens)
      .where(eq(screens.organizationId, organizationId));
  }

  async getScreenById(id: string, organizationId: string) {
    const result = await this.dbService.db
      .select()
      .from(screens)
      .where(
        and(eq(screens.id, id), eq(screens.organizationId, organizationId)),
      );
    return result[0];
  }

  async seedSystem(orgId: string) {
    console.log('🌱 Seeding Presentation System Templates...');
    const systemTemplates = [
      {
        name: 'Fullscreen Content',
        structure: JSON.stringify({
          type: 'container',
          styles: { display: 'flex', flex: 1 },
          children: [
            {
              type: 'slot',
              id: 'main',
              name: 'Main Content',
              styles: { flex: 1 },
            },
          ],
        }),
        isSystem: true,
        organizationId: orgId,
      },
      {
        name: 'Two Column Grid',
        structure: JSON.stringify({
          type: 'container',
          styles: { display: 'flex', flexDirection: 'row', flex: 1 },
          children: [
            {
              type: 'slot',
              id: 'left',
              name: 'Left Column',
              styles: { flex: 1 },
            },
            {
              type: 'slot',
              id: 'right',
              name: 'Right Column',
              styles: { flex: 1 },
            },
          ],
        }),
        isSystem: true,
        organizationId: orgId,
      },
    ];

    for (const t of systemTemplates) {
      await this.dbService.db.insert(templates).values(t).onConflictDoNothing();
    }
  }

  async seedSample(orgId: string) {
    logger.info('  └─ Seeding Presentation Sample Data...');
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

  async updateTemplate(
    id: string,
    organizationId: string,
    data: Partial<typeof templates.$inferInsert>,
  ) {
    const result = await this.dbService.db
      .update(templates)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(eq(templates.id, id), eq(templates.organizationId, organizationId)),
      )
      .returning();
    return result[0];
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

  async deleteTemplate(id: string, organizationId: string) {
    await this.dbService.db.delete(templates).where(
      and(
        eq(templates.id, id),
        eq(templates.organizationId, organizationId),
        eq(templates.isSystem, false), // Prevent deleting system templates
      ),
    );
    return { success: true };
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
  async assignScreenToDisplay(data: typeof displayAssignments.$inferInsert) {
    const result = await this.dbService.db
      .insert(displayAssignments)
      .values(data)
      .onConflictDoUpdate({
        target: [displayAssignments.displayId],
        set: { screenId: data.screenId, updatedAt: new Date() },
      })
      .returning();

    const display = await this.dbService.db.query.displays.findFirst({
      where: eq(displays.id, data.displayId),
    });

    if (display?.hardwareId) {
      // Find the screen and layout to push full config
      const screen = await this.dbService.db.query.screens.findFirst({
        where: eq(screens.id, data.screenId),
        with: {
          layout: true,
        },
      });

      if (screen) {
        this.realtimeGateway.emitToHardware(
          display.hardwareId,
          'presentation:update',
          {
            screenId: data.screenId,
            structure: JSON.parse(screen.layout.structure),
            slots: JSON.parse(screen.slots),
            customCss: screen.customCss,
          },
        );
      }
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
