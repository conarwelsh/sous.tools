import { Injectable } from '@nestjs/common';
import { logger } from '@sous/logger';
import { PosInterface } from './pos.interface.js';
import { DatabaseService } from '../../core/database/database.service.js';
import { PosService } from '../../pos/services/pos.service.js';
import { products, categories } from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';

@Injectable()
export class SousDriver implements PosInterface {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly posService: PosService,
    private readonly organizationId: string,
  ) {}

  async fetchSales(startDate: Date, endDate: Date): Promise<any[]> {
    logger.info(`[Sous] Fetching sales for org ${this.organizationId}`);
    // In a real scenario, we'd query our posOrders table filtered by date
    const orders = await this.dbService.readDb.query.posOrders.findMany({
      where: (o) => eq(o.organizationId, this.organizationId),
      with: {
        items: true,
      },
    });
    return orders;
  }

  async fetchCatalog(): Promise<any[]> {
    logger.info(`[Sous] Fetching catalog for org ${this.organizationId}`);
    const dbProducts = await this.dbService.readDb.query.products.findMany({
      where: (p) => eq(p.organizationId, this.organizationId),
    });
    const dbCategories = await this.dbService.readDb.query.categories.findMany({
      where: (c) => eq(c.organizationId, this.organizationId),
    });

    return [
      ...dbCategories.map((c) => ({
        type: 'CATEGORY',
        id: c.id,
        name: c.name,
      })),
      ...dbProducts.map((p) => ({
        type: 'ITEM',
        id: p.id,
        name: p.name,
        price: p.price,
        categoryId: p.categoryId,
      })),
    ];
  }

  async fetchLocations(): Promise<any[]> {
    return this.dbService.readDb.query.locations.findMany({
      where: (l) => eq(l.organizationId, this.organizationId),
    });
  }

  async fetchInventory(): Promise<any[]> {
    // Return ingredient stocks
    return this.dbService.readDb.query.ingredients.findMany({
      where: (s) => eq(s.organizationId, this.organizationId),
    });
  }

  async createCategory(name: string): Promise<any> {
    const [cat] = await this.dbService.db
      .insert(categories)
      .values({
        name,
        organizationId: this.organizationId,
      })
      .returning();
    return cat;
  }

  async createProduct(data: {
    name: string;
    categoryId?: string;
    price: number;
    description?: string;
    sku?: string;
  }): Promise<any> {
    const [prod] = await this.dbService.db
      .insert(products)
      .values({
        name: data.name,
        categoryId: data.categoryId,
        price: data.price,
        organizationId: this.organizationId,
      })
      .returning();
    return prod;
  }

  async updateProduct(productId: string, productData: any): Promise<any> {
    const [prod] = await this.dbService.db
      .update(products)
      .set({
        ...productData,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(products.id, productId),
          eq(products.organizationId, this.organizationId),
        ),
      )
      .returning();
    return prod;
  }

  async deleteProduct(productId: string): Promise<any> {
    await this.dbService.db
      .delete(products)
      .where(
        and(
          eq(products.id, productId),
          eq(products.organizationId, this.organizationId),
        ),
      );
    return { success: true };
  }

  async createOrder(orderData: any): Promise<any> {
    // Get an open ledger for the location
    const ledger = (await this.posService.getOpenLedger(
      orderData.locationId,
    )) as any;
    if (!ledger) throw new Error('No open ledger found for this location');

    return this.posService.recordSale(
      this.organizationId,
      orderData,
      ledger.id,
    );
  }

  subscribeToOrders(callback: (order: any) => void): void {
    logger.info('[Sous] Local order subscription handled via RealtimeGateway');
  }
}
