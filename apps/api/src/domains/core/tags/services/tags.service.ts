import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service.js';
import { tags, tagAssignments } from '../../database/schema.js';
import { eq, and, inArray } from 'drizzle-orm';

@Injectable()
export class TagsService {
  constructor(private readonly dbService: DatabaseService) {}

  async getTags(organizationId: string, entityType?: string) {
    if (entityType) {
      // If entityType is provided, we might want to filter tags that have been used for this entity type
      // or just return all tags available to the org. The spec says "Fetch available tags".
      // Usually, all tags in an org are available for all entities unless we add a 'scope' to tags.
      // For now, let's just return all tags for the org.
    }
    return this.dbService.db
      .select()
      .from(tags)
      .where(eq(tags.organizationId, organizationId));
  }

  async createTag(data: typeof tags.$inferInsert) {
    const result = await this.dbService.db
      .insert(tags)
      .values(data)
      .returning();
    return result[0];
  }

  async updateTag(id: string, data: Partial<typeof tags.$inferInsert>) {
    const result = await this.dbService.db
      .update(tags)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tags.id, id))
      .returning();
    return result[0];
  }

  async deleteTag(id: string) {
    return this.dbService.db.delete(tags).where(eq(tags.id, id)).returning();
  }

  async getAssignments(entityType: string, entityId: string) {
    return this.dbService.db.query.tagAssignments.findMany({
      where: and(
        eq(tagAssignments.entityType, entityType),
        eq(tagAssignments.entityId, entityId),
      ),
      with: {
        tag: true,
      },
    });
  }

  async assignTags(entityType: string, entityId: string, tagIds: string[]) {
    return this.dbService.db.transaction(async (tx) => {
      // 1. Remove existing assignments
      await tx
        .delete(tagAssignments)
        .where(
          and(
            eq(tagAssignments.entityType, entityType),
            eq(tagAssignments.entityId, entityId),
          ),
        );

      // 2. Add new assignments
      if (tagIds.length > 0) {
        await tx.insert(tagAssignments).values(
          tagIds.map((tagId) => ({
            tagId,
            entityType,
            entityId,
          })),
        );
      }

      // 3. Return updated assignments
      return tx.query.tagAssignments.findMany({
        where: and(
          eq(tagAssignments.entityType, entityType),
          eq(tagAssignments.entityId, entityId),
        ),
        with: {
          tag: true,
        },
      });
    });
  }
}
