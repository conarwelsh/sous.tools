import {
  Injectable,
  NotFoundException,
  Inject,
  Optional,
} from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  layouts,
  displays,
  displayAssignments,
  organizations,
} from '../../core/database/schema.js';
import { eq, and, or, desc } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { RealtimeGateway } from '../../realtime/realtime.gateway.js';
import { PubSub } from 'graphql-subscriptions';

import { users } from '../../core/database/schema.js';

@Injectable()
export class PresentationService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    @Optional()
    @Inject(RealtimeGateway)
    private readonly realtimeGateway?: RealtimeGateway,
    @Optional()
    @Inject('PUB_SUB')
    private readonly pubSub?: PubSub,
  ) {}

  async getUserOrganizationId(userId: string) {
    const user = await this.dbService.readDb.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { organizationId: true },
    });
    return user?.organizationId;
  }

  // --- Layout Management (Unified) ---

  async createLayout(data: typeof layouts.$inferInsert) {
    // Ensure JSON fields are stringified if they came in as objects
    const safeData: any = { ...data };
    if (safeData.structure && typeof safeData.structure === 'object') {
      safeData.structure = JSON.stringify(safeData.structure);
    }
    if (safeData.content && typeof safeData.content === 'object') {
      safeData.content = JSON.stringify(safeData.content);
    }
    if (safeData.config && typeof safeData.config === 'object') {
      safeData.config = JSON.stringify(safeData.config);
    }

    // Strip redundant fields
    delete safeData.id;
    delete safeData.createdAt;
    delete safeData.updatedAt;

    const result = await this.dbService.db
      .insert(layouts)
      .values(safeData)
      .returning();
    return result[0];
  }

  async updateLayout(
    id: string,
    organizationId: string,
    data: Partial<typeof layouts.$inferInsert> & { assignments?: any },
  ) {
    const { assignments, ...layoutData } = data;

    // Ensure JSON fields are stringified if they came in as objects
    const safeData: any = { ...layoutData };
    if (safeData.structure && typeof safeData.structure === 'object') {
      safeData.structure = JSON.stringify(safeData.structure);
    }
    if (safeData.content && typeof safeData.content === 'object') {
      safeData.content = JSON.stringify(safeData.content);
    }
    if (safeData.config && typeof safeData.config === 'object') {
      safeData.config = JSON.stringify(safeData.config);
    }

    // Strip redundant fields that might cause constraint issues or are immutable
    delete safeData.id;
    delete safeData.organizationId;
    delete safeData.createdAt;
    delete safeData.updatedAt;

    try {
      logger.info(`[PresentationService] Updating layout ${id}`, { safeDataKeys: Object.keys(safeData) });

      const result = await this.dbService.db
        .update(layouts)
        .set({ ...safeData, updatedAt: new Date() })
        .where(
          and(eq(layouts.id, id), eq(layouts.organizationId, organizationId)),
        )
        .returning();

      if (!result[0]) throw new NotFoundException('Layout not found');

      const updatedLayout = result[0];

      // Handle Display Assignments if provided (specifically for type 'SCREEN')
      if (
        updatedLayout.type === 'SCREEN' &&
        assignments?.hardware &&
        Array.isArray(assignments.hardware)
      ) {
        for (const displayId of assignments.hardware) {
          await this.assignLayoutToDisplay({
            displayId,
            layoutId: id,
          });
        }
      }

      return updatedLayout;
    } catch (e: any) {
      logger.error(`[PresentationService] Failed to update layout ${id}: ${e.message}`, {
        stack: e.stack,
        safeData,
      });
      throw e;
    }
  }

  async deleteLayout(id: string, organizationId: string) {
    await this.dbService.db
      .delete(layouts)
      .where(
        and(eq(layouts.id, id), eq(layouts.organizationId, organizationId)),
      );
    return { success: true };
  }

  async getLayouts(organizationId: string, type?: string) {
    const conditions = [eq(layouts.organizationId, organizationId)];
    if (type) conditions.push(eq(layouts.type, type));

    return this.dbService.readDb
      .select()
      .from(layouts)
      .where(and(...conditions));
  }

  async getLayoutById(id: string, organizationId: string) {
    const result = await this.dbService.readDb
      .select()
      .from(layouts)
      .where(
        and(eq(layouts.id, id), eq(layouts.organizationId, organizationId)),
      );
    return result[0];
  }

  async getTemplates(organizationId: string) {
    return this.dbService.readDb
      .select()
      .from(layouts)
      .where(
        and(
          eq(layouts.type, 'TEMPLATE'),
          or(
            eq(layouts.organizationId, organizationId),
            eq(layouts.isSystem, true),
          ),
        ),
      );
  }

  async getLayoutBySlug(slug: string, organizationId?: string) {
    // webSlug is stored in the 'config' JSON field
    const organizationLayouts = await this.dbService.readDb
      .select()
      .from(layouts)
      .where(
        and(
          eq(layouts.type, 'PAGE'),
          organizationId
            ? eq(layouts.organizationId, organizationId)
            : undefined,
        ),
      );

    const layout = organizationLayouts.find((l) => {
      try {
        const config = JSON.parse(l.config);
        return config && config.webSlug === slug;
      } catch (e) {
        return false;
      }
    });

    if (!layout) {
      throw new NotFoundException('Page not found');
    }

    return layout;
  }

  async seedSystem(orgId: string) {
    logger.info('🌱 Seeding Presentation System Templates...');

    const systemOrg = await this.dbService.readDb.query.organizations.findFirst({
      where: eq(organizations.slug, 'system'),
    });

    const targetOrgId = systemOrg?.id || orgId;

    const systemTemplates = [
      {
        name: 'Fullscreen Content',
        type: 'TEMPLATE',
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
        organizationId: targetOrgId,
      },
      {
        name: 'Two Column Grid',
        type: 'TEMPLATE',
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
        organizationId: targetOrgId,
      },
    ];

    for (const t of systemTemplates) {
      await this.dbService.db.insert(layouts).values(t).onConflictDoNothing();
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

  // --- Displays ---
  async createDisplay(data: typeof displays.$inferInsert) {
    const result = await this.dbService.db
      .insert(displays)
      .values(data)
      .returning();
    return result[0];
  }

  async getDisplays(organizationId: string) {
    return this.dbService.readDb
      .select()
      .from(displays)
      .where(eq(displays.organizationId, organizationId));
  }

  async getDisplayById(id: string, organizationId: string) {
    const result = await this.dbService.readDb
      .select()
      .from(displays)
      .where(
        and(eq(displays.id, id), eq(displays.organizationId, organizationId)),
      );
    return result[0];
  }

  // --- Assignments ---
  async assignLayoutToDisplay(data: typeof displayAssignments.$inferInsert) {
    try {
      const result = await this.dbService.db
        .insert(displayAssignments)
        .values(data)
        .onConflictDoUpdate({
          target: [displayAssignments.displayId],
          set: { layoutId: data.layoutId, updatedAt: new Date() },
        })
        .returning();

      const display = await this.dbService.readDb.query.displays.findFirst({
        where: eq(displays.id, data.displayId),
      });

      if (display?.hardwareId) {
        const layout = await this.dbService.readDb.query.layouts.findFirst({
          where: eq(layouts.id, data.layoutId),
        });

        if (layout && this.realtimeGateway) {
          // Defensive parsing to prevent crash if DB content is corrupt
          const safeParse = (str: string | null) => {
            try {
              return str ? JSON.parse(str) : {};
            } catch (e) {
              logger.warn(`[PresentationService] Failed to parse JSON field: ${str}`);
              return {};
            }
          };

          this.realtimeGateway.emitToHardware(
            display.hardwareId,
            'presentation:update',
            {
              layoutId: layout.id,
              structure: safeParse(layout.structure),
              content: safeParse(layout.content),
              config: safeParse(layout.config),
            },
          );
        }

        if (layout && display.hardwareId && this.pubSub) {
          this.pubSub.publish('presentationUpdated', {
            presentationUpdated: {
              hardwareId: display.hardwareId,
              layout: {
                id: layout.id,
                name: layout.name,
                structure: layout.structure,
                content: layout.content,
                config: layout.config,
              },
            },
          });
        }
      }

      return result[0];
    } catch (e: any) {
      logger.error(`[PresentationService] Failed to assign layout to display: ${e.message}`, {
        stack: e.stack,
        displayId: data.displayId,
        layoutId: data.layoutId,
      });
      throw e;
    }
  }

  async getAssignmentsForDisplay(displayId: string) {
    return this.dbService.readDb
      .select()
      .from(displayAssignments)
      .where(eq(displayAssignments.displayId, displayId));
  }

  async getActiveLayoutByHardwareId(hardwareId: string) {
    logger.info(`[PresentationService] Fetching active layout for hardwareId: ${hardwareId}`);
    const display = await this.dbService.readDb.query.displays.findFirst({
      where: eq(displays.hardwareId, hardwareId),
      with: {
        assignments: {
          with: {
            layout: true,
          },
        },
      },
    });

    if (!display) {
      logger.warn(`[PresentationService] No display found for hardwareId: ${hardwareId}`);
      return null;
    }

    if (!display.assignments?.[0]) {
      logger.warn(`[PresentationService] No assignments found for display: ${display.id} (${display.name})`);
      return null;
    }

    logger.info(`[PresentationService] Found layout ${display.assignments[0].layout.id} for display ${display.name}`);
    return display.assignments[0].layout;
  }
}
