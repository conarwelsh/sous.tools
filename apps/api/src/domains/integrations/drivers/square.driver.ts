import { Injectable } from '@nestjs/common';
import { logger } from '@sous/logger';
import { PosInterface } from './pos.interface.js';
import { SquareClient, SquareEnvironment } from 'square';

@Injectable()
export class SquareDriver implements PosInterface {
  private client: SquareClient;

  constructor(credentials: { accessToken: string; environment?: string }) {
    const env =
      credentials.environment === 'sandbox'
        ? SquareEnvironment.Sandbox
        : SquareEnvironment.Production;
    logger.info(
      `[Square] Initializing driver in ${credentials.environment || 'unknown'} mode (Resolved: ${env})`,
    );
    this.client = new SquareClient({
      token: credentials.accessToken,
      environment: env,
    });
  }

  async fetchSales(startDate: Date, endDate: Date) {
    logger.info(
      `[Square] Fetching sales from ${startDate.toISOString()} to ${endDate.toISOString()}`,
    );
    try {
      const response = (await this.client.orders.search({
        locationIds: [], // Empty means all locations for this token
        query: {
          filter: {
            dateTimeFilter: {
              createdAt: {
                startAt: startDate.toISOString(),
                endAt: endDate.toISOString(),
              },
            },
            stateFilter: {
              states: ['COMPLETED'],
            },
          },
        },
      })) as any;

      const body = response.result || response.data || response;
      return body.orders || [];
    } catch (error) {
      logger.error('[Square] Failed to fetch sales:', error);
      throw error;
    }
  }

  // Changed return type to Promise<any[]> to match PosInterface expectation
  async fetchCatalog(): Promise<any[]> {
    logger.info(`[Square] Fetching catalog`);
    try {
      const response = (await this.client.catalog.list({
        types: 'ITEM,CATEGORY',
      })) as any;
      const body = response.result || response.data || response;
      const objects = body.objects || [];

      // Flatten categories and products into a single array, tagging each item with its type
      const catalogItems = objects.flatMap((obj: any) => {
        if (obj.type === 'CATEGORY') {
          return {
            type: 'CATEGORY',
            id: obj.id,
            name: obj.categoryData?.name,
          };
        } else if (obj.type === 'ITEM') {
          return {
            type: 'ITEM',
            id: obj.id,
            name: obj.itemData?.name,
            categoryId: obj.itemData?.categoryId,
            price: Number(
              obj.itemData?.variations?.[0]?.itemVariationData?.priceMoney
                ?.amount || 0,
            ),
          };
        }
        return [];
      });

      return catalogItems;
    } catch (error) {
      logger.error('[Square] Failed to fetch catalog:', error);
      throw error;
    }
  }

  async fetchLocations() {
    try {
      const response = (await this.client.locations.list()) as any;
      const body = response.result || response.data || response;
      return body.locations || [];
    } catch (error) {
      logger.error('[Square] Failed to fetch locations:', error);
      throw error;
    }
  }

  async fetchInventory() {
    try {
      const response = (await this.client.inventory.batchGetCounts({
        // Empty means all items
      })) as any;
      const body = response.result || response.data || response;
      return body.counts || [];
    } catch (error) {
      logger.error('[Square] Failed to fetch inventory:', error);
      throw error;
    }
  }

  async createCategory(name: string) {
    try {
      const response = (await this.client.catalog.object.upsert({
        idempotencyKey: `cat_${Date.now()}_${name.toLowerCase().replace(/\s+/g, '_')}`,
        object: {
          type: 'CATEGORY',
          id: `#${name}`,
          categoryData: { name },
        },
      })) as any;
      const body = response.result || response.data || response;
      return body.catalogObject;
    } catch (error) {
      logger.error(`[Square] Failed to create category ${name}:`, error);
      throw error;
    }
  }

  async createItem(data: {
    name: string;
    categoryId?: string;
    price: number;
    description?: string;
    sku?: string;
  }) {
    try {
      const response = (await this.client.catalog.object.upsert({
        idempotencyKey: `item_${Date.now()}_${data.name.toLowerCase().replace(/\s+/g, '_')}`,
        object: {
          type: 'ITEM',
          id: `#${data.name}`,
          itemData: {
            name: data.name,
            description: data.description,
            categoryId: data.categoryId,
            variations: [
              {
                type: 'ITEM_VARIATION',
                id: `#${data.name}_regular`,
                itemVariationData: {
                  name: 'Regular',
                  sku: data.sku,
                  pricingType: 'FIXED_PRICING',
                  priceMoney: {
                    amount: BigInt(data.price),
                    currency: 'USD',
                  },
                },
              },
            ],
          },
        },
      })) as any;
      const body = response.result || response.data || response;
      return body.catalogObject;
    } catch (error) {
      logger.error(`[Square] Failed to create item ${data.name}:`, error);
      throw error;
    }
  }

  async updateItem(itemId: string, itemData: any) {
    try {
      const response = (await this.client.catalog.object.upsert({
        idempotencyKey: `update_${Date.now()}_${itemId}`,
        object: {
          ...itemData,
          id: itemId,
        },
      })) as any;
      const body = response.result || response.data || response;
      return body.catalogObject;
    } catch (error) {
      logger.error(`[Square] Failed to update item ${itemId}:`, error);
      throw error;
    }
  }

  async deleteItem(itemId: string) {
    try {
      await this.client.catalog.object.delete({ objectId: itemId });
      return { success: true };
    } catch (error) {
      logger.error(`[Square] Failed to delete item ${itemId}:`, error);
      throw error;
    }
  }

  async createOrder(orderData: any) {
    logger.info(`[Square] Creating order`, orderData);
    try {
      const response = (await this.client.orders.create({
        order: orderData,
        idempotencyKey: `order_${Date.now()}`,
      })) as any;
      const body = response.result || response.data || response;
      return body.order;
    } catch (error) {
      logger.error('[Square] Failed to create order:', error);
      throw error;
    }
  }

  async seedCatalog() {
    logger.info('[Square] Seeding expanded catalog (Full Overwrite)...');

    // 1. Wipe existing catalog data first
    try {
      // Use search to get ALL items and categories if possible, or just list
      const response = (await this.client.catalog.list({
        types: 'ITEM,CATEGORY',
      })) as any;
      const body = response.result || response.data || response;
      const objects = body.objects || [];
      const idsToDelete = objects.map((obj: any) => obj.id);

      if (idsToDelete.length > 0) {
        logger.info(
          `[Square] Deleting ${idsToDelete.length} existing catalog objects...`,
        );
        await this.client.catalog.batchDelete({
          objectIds: idsToDelete,
        });
        // Small delay to let Square process the deletions
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    } catch (error: any) {
      logger.warn('[Square] Pre-seed wipe failed or was empty:', error.message);
    }

    const categoryNames = [
      'Appetizers',
      'Main Courses',
      'Sides',
      'Beverages',
      'Cocktails',
      'Desserts',
    ];

    const itemConfigs = [
      {
        name: 'Truffle Parmesan Fries',
        price: 1200,
        category: 'Appetizers',
        description:
          'Hand-cut fries tossed in white truffle oil and fresh parmesan.',
      },
      {
        name: 'Sous Signature Burger',
        price: 1800,
        category: 'Main Courses',
        description:
          'Double wagyu beef, aged cheddar, caramelised onions, brioche.',
      },
      {
        name: 'Honey Glazed Sprouts',
        price: 900,
        category: 'Sides',
        description: 'Crispy brussels sprouts with spicy honey and pancetta.',
      },
      {
        name: 'Local Craft IPA',
        price: 800,
        category: 'Beverages',
        description: 'Rotating seasonal IPA from the valley.',
      },
      {
        name: 'Smoked Old Fashioned',
        price: 1600,
        category: 'Cocktails',
        description: 'Bourbon, maple, walnut bitters, cherry wood smoke.',
      },
      {
        name: 'NY Style Cheesecake',
        price: 1000,
        category: 'Desserts',
        description:
          'Velvety smooth with a graham cracker crust and berry coulis.',
      },
      {
        name: 'Nitro Cold Brew',
        price: 600,
        category: 'Beverages',
        description: 'Velvety smooth nitrogen-infused coffee.',
      },
      {
        name: 'Margherita Pizza',
        price: 2200,
        category: 'Main Courses',
        description:
          'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil.',
      },
    ];

    const objects: any[] = [];

    // 1. Add Categories to batch - use simple alphanumeric temp IDs
    categoryNames.forEach((name) => {
      const safeName = name.replace(/[^a-zA-Z0-9]/g, '');
      objects.push({
        type: 'CATEGORY',
        id: `#cat${safeName}`,
        categoryData: { name },
      });
    });

    // 2. Add Items to batch with references to the categories
    itemConfigs.forEach((item) => {
      const safeItemName = item.name.replace(/[^a-zA-Z0-9]/g, '');
      const safeCatName = item.category.replace(/[^a-zA-Z0-9]/g, '');

      objects.push({
        type: 'ITEM',
        id: `#item${safeItemName}`,
        itemData: {
          name: item.name,
          description: item.description,
          categoryId: `#cat${safeCatName}`,
          variations: [
            {
              type: 'ITEM_VARIATION',
              id: `#var${safeItemName}`,
              itemVariationData: {
                name: 'Regular',
                pricingType: 'FIXED_PRICING',
                priceMoney: {
                  amount: BigInt(item.price),
                  currency: 'USD',
                },
              },
            },
          ],
        },
      });
    });

    try {
      const response = (await this.client.catalog.batchUpsert({
        idempotencyKey: `seed_${Date.now()}`,
        batches: [{ objects }],
      })) as any;

      const resultBody = response.result || response.data || response;
      logger.info(
        `[Square] Batch seeded ${resultBody.objects?.length || 0} objects with proper references.`,
      );
    } catch (error: any) {
      const errorBody = error.result || error.data || error;
      logger.error(
        '[Square] Batch seeding failed:',
        error.message,
        errorBody?.errors,
      );
      throw error;
    }

    logger.info('[Square] Expanded catalog seeding complete.');
  }

  subscribeToOrders(callback: (order: any) => void) {
    logger.info(
      `[Square] Webhook subscription should be handled via controllers`,
    );
  }
}
