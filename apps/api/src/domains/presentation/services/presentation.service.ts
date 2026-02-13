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
import { eq, and, or } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { RealtimeGateway } from '../../realtime/realtime.gateway.js';

import { users } from '../../core/database/schema.js';

@Injectable()
export class PresentationService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    @Optional()
    @Inject(RealtimeGateway)
    private readonly realtimeGateway?: RealtimeGateway,
  ) {}

  async getUserOrganizationId(userId: string) {
    const user = await this.dbService.db.query.users.findFirst({
      where: eq(users.id, userId),
      columns: { organizationId: true },
    });
    return user?.organizationId;
  }

  // --- Layout Management (Unified) ---

  async createLayout(data: typeof layouts.$inferInsert) {
    const result = await this.dbService.db
      .insert(layouts)
      .values(data)
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
    const safeData = { ...layoutData };
    if (typeof safeData.structure === 'object') {
      safeData.structure = JSON.stringify(safeData.structure);
    }
    if (typeof safeData.content === 'object') {
      safeData.content = JSON.stringify(safeData.content);
    }
    if (typeof safeData.config === 'object') {
      safeData.config = JSON.stringify(safeData.config);
    }

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

    return this.dbService.db
      .select()
      .from(layouts)
      .where(and(...conditions));
  }

  async getLayoutById(id: string, organizationId: string) {
    const result = await this.dbService.db
      .select()
      .from(layouts)
      .where(
        and(eq(layouts.id, id), eq(layouts.organizationId, organizationId)),
      );
    return result[0];
  }

  async getTemplates(organizationId: string) {
    return this.dbService.db
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
    const organizationLayouts = await this.dbService.db
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

    const systemOrg = await this.dbService.db.query.organizations.findFirst({
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
  async assignLayoutToDisplay(data: typeof displayAssignments.$inferInsert) {
    const result = await this.dbService.db
      .insert(displayAssignments)
      .values(data)
      .onConflictDoUpdate({
        target: [displayAssignments.displayId],
        set: { layoutId: data.layoutId, updatedAt: new Date() },
      })
      .returning();

    const display = await this.dbService.db.query.displays.findFirst({
      where: eq(displays.id, data.displayId),
    });

    if (display?.hardwareId) {
      const layout = await this.dbService.db.query.layouts.findFirst({
        where: eq(layouts.id, data.layoutId),
      });

      if (layout && this.realtimeGateway) {
        this.realtimeGateway.emitToHardware(
          display.hardwareId,
          'presentation:update',
          {
            layoutId: layout.id,
            structure: JSON.parse(layout.structure),
            content: JSON.parse(layout.content),
            config: JSON.parse(layout.config),
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
