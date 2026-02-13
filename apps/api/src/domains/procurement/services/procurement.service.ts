import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  suppliers,
  shoppingList,
  purchaseOrders,
  poItems,
  ingredients,
  invoices,
  invoiceItems,
} from '../../core/database/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import { logger } from '@sous/logger';

@Injectable()
export class ProcurementService {
  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {}

  async getSuppliers(organizationId: string) {
    return this.dbService.db.query.suppliers.findMany({
      where: eq(suppliers.organizationId, organizationId),
    });
  }

  async createSupplier(data: typeof suppliers.$inferInsert) {
    const [result] = await this.dbService.db
      .insert(suppliers)
      .values(data)
      .returning();
    return result;
  }

  async getInvoices(organizationId: string) {
    return this.dbService.db.query.invoices.findMany({
      where: eq(invoices.organizationId, organizationId),
      with: {
        supplier: true,
        items: true,
      },
    });
  }

  async createInvoice(data: typeof invoices.$inferInsert, items: (typeof invoiceItems.$inferInsert)[]) {
    return await this.dbService.db.transaction(async (tx) => {
      const [invoice] = await tx.insert(invoices).values(data).returning();
      if (items.length > 0) {
        await tx.insert(invoiceItems).values(
          items.map(item => ({ ...item, invoiceId: invoice.id }))
        );
      }
      return invoice;
    });
  }

  async getShoppingList(organizationId: string) {
    return this.dbService.db.query.shoppingList.findMany({
      where: and(
        eq(shoppingList.organizationId, organizationId),
        eq(shoppingList.status, 'pending'),
      ),
      with: {
        ingredient: true,
        preferredSupplier: true,
      },
    });
  }

  async addToShoppingList(
    organizationId: string,
    ingredientId: string,
    quantity: number,
    unit: string,
  ) {
    // Smart logic: find last supplier for this ingredient
    const lastInvoiceItem = await this.dbService.db.query.invoiceItems.findFirst({
      where: eq(invoiceItems.ingredientId, ingredientId),
      with: {
        invoice: true,
      },
      orderBy: [desc(invoiceItems.id)], 
    });

    const preferredSupplierId = lastInvoiceItem?.invoice?.supplierId || null;

    return this.dbService.db
      .insert(shoppingList)
      .values({
        organizationId,
        ingredientId,
        quantity,
        unit,
        preferredSupplierId,
        status: 'pending',
        source: 'manual',
      })
      .returning();
  }

  async updateShoppingListItem(
    id: string,
    organizationId: string,
    updates: { quantity?: number; preferredSupplierId?: string | null; status?: string },
  ) {
    return this.dbService.db
      .update(shoppingList)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(shoppingList.id, id), eq(shoppingList.organizationId, organizationId)))
      .returning();
  }

  async placeOrder(organizationId: string, supplierId: string, itemIds: string[]) {
    return await this.dbService.db.transaction(async (tx) => {
      const [po] = await tx
        .insert(purchaseOrders)
        .values({
          organizationId,
          supplierId,
          status: 'open',
          totalAmount: 0, 
        })
        .returning();

      const items = await tx.query.shoppingList.findMany({
        where: and(
          eq(shoppingList.organizationId, organizationId),
          sql`${shoppingList.id} IN ${itemIds}`
        ),
      });

      if (items.length > 0) {
        await tx.insert(poItems).values(
          items.map((item) => ({
            purchaseOrderId: po.id,
            ingredientId: item.ingredientId,
            quantity: item.quantity,
            unit: item.unit,
          })),
        );

        await tx
          .update(shoppingList)
          .set({ status: 'ordered', updatedAt: new Date() })
          .where(and(
            eq(shoppingList.organizationId, organizationId),
            sql`${shoppingList.id} IN ${itemIds}`
          ));
      }

      return po;
    });
  }

  async seedSystem(orgId: string) {
    logger.info('  └─ Seeding Procurement System Data...');
  }

  async seedSample(orgId: string) {
    logger.info('  └─ Seeding Procurement Sample Data...');
    const [sysco] = await this.dbService.db
      .insert(suppliers)
      .values({
        name: 'Sysco',
        organizationId: orgId,
        deliveryDays: [1, 3, 5], // Mon, Wed, Fri
        cutoffTime: '16:00',
      })
      .onConflictDoNothing()
      .returning();

    const [usFoods] = await this.dbService.db
      .insert(suppliers)
      .values({
        name: 'US Foods',
        organizationId: orgId,
        deliveryDays: [2, 4], // Tue, Thu
        cutoffTime: '15:00',
      })
      .onConflictDoNothing()
      .returning();
  }
}
