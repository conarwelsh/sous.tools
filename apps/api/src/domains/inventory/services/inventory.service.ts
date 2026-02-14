import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import { MailService } from '../../core/mail/mail.service.js';
import { stockLedger } from '../inventory.schema.js';
import { ingredients, users, recipes } from '../../core/database/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { CulinaryService } from '../../culinary/services/culinary.service.js';
import { ModuleRef } from '@nestjs/core';

@Injectable()
export class InventoryService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
    private readonly mailService: MailService,
    private readonly moduleRef: ModuleRef,
  ) {}

  private get culinaryService() {
    return this.moduleRef.get(CulinaryService, { strict: false });
  }

  async depleteStockByRecipe(organizationId: string, locationId: string, recipeId: string, quantity: number) {
    const recipe = await this.culinaryService.getRecipe(recipeId, organizationId);
    if (!recipe) throw new Error('Recipe not found');

    for (const item of recipe.ingredients) {
      if (item.ingredientId) {
        await this.depleteStock(
          organizationId,
          locationId,
          item.ingredientId,
          item.amount * quantity // Scale by number of portions/yields
        );
      }
    }
  }

  async getLedger(organizationId: string, locationId?: string) {
    const filters = [eq(stockLedger.organizationId, organizationId)];
    if (locationId) filters.push(eq(stockLedger.locationId, locationId));

    return this.dbService.readDb
      .select()
      .from(stockLedger)
      .where(and(...filters));
  }

  async recordMovement(data: typeof stockLedger.$inferInsert) {
    const result = await this.dbService.db
      .insert(stockLedger)
      .values(data)
      .returning();
    
    // Trigger Low Stock Check (Async)
    void this.checkLowStock(data.organizationId, data.ingredientId);

    return result[0];
  }

  private async checkLowStock(organizationId: string, ingredientId: string) {
    try {
      // 1. Get Ingredient Info
      const ingredient = await this.dbService.readDb.query.ingredients.findFirst({
        where: and(eq(ingredients.id, ingredientId), eq(ingredients.organizationId, organizationId)),
      });

      if (!ingredient || !ingredient.parLevel) return;

      // 2. Check if we sent an alert recently (e.g. within 1 hour)
      if (ingredient.lastAlertAt && Date.now() - new Date(ingredient.lastAlertAt).getTime() < 3600000) {
        return;
      }

      // 3. Calculate Current Stock
      const stockResult = await this.dbService.readDb
        .select({ total: sql<number>`sum(amount)` })
        .from(stockLedger)
        .where(and(eq(stockLedger.ingredientId, ingredientId), eq(stockLedger.organizationId, organizationId)));

      const currentStock = Number(stockResult[0]?.total || 0);

      if (currentStock < ingredient.parLevel) {
        logger.warn(`⚠️ Low Stock Alert: ${ingredient.name} is at ${currentStock} (Par: ${ingredient.parLevel})`);

        // 4. Update lastAlertAt to prevent spam
        await this.dbService.db.update(ingredients)
          .set({ lastAlertAt: new Date() })
          .where(eq(ingredients.id, ingredientId));

        // 5. Notify Admins
        const admins = await this.dbService.readDb.query.users.findMany({
          where: and(eq(users.organizationId, organizationId), eq(users.role, 'admin')),
        });

        for (const admin of admins) {
          await this.mailService.sendEmail({
            to: admin.email,
            subject: `Low Stock Alert: ${ingredient.name}`,
            template: 'low-stock',
            context: {
              items: [{
                name: ingredient.name,
                current: currentStock,
                threshold: ingredient.parLevel,
                unit: ingredient.baseUnit
              }]
            }
          });
        }
      }
    } catch (e: any) {
      logger.error(`[Inventory] Failed to check low stock: ${e.message}`);
    }
  }

  async depleteStock(
    organizationId: string,
    locationId: string,
    ingredientId: string,
    amount: number,
  ) {
    return this.recordMovement({
      organizationId,
      locationId,
      ingredientId,
      amount: -amount,
      type: 'sale',
    });
  }
}
