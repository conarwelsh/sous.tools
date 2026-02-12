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
      let objects = body.objects || [];

      if (objects.length === 0 && Array.isArray(body)) {
        objects = body;
      }

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
      const response = (await this.client.catalog.search({
        objectTypes: ['ITEM', 'CATEGORY'],
      })) as any;

      const body = response.result || response.data || response;
      const objects = body.objects || [];
      const idsToDelete = objects.map((obj: any) => obj.id);

      if (idsToDelete.length > 0) {
        logger.info(
          `[Square] Deleting ${idsToDelete.length} existing catalog objects...`,
        );

        // Square batchDelete has a limit of 200 IDs
        for (let i = 0; i < idsToDelete.length; i += 200) {
          const batch = idsToDelete.slice(i, i + 200);
          await this.client.catalog.batchDelete({
            objectIds: batch,
          });
        }

        // Small delay to let Square process the deletions
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // Verify it's actually empty
        const verify = (await this.client.catalog.search({
            objectTypes: ['ITEM', 'CATEGORY'],
        })) as any;
        const vBody = verify.result || verify.data || verify;
        if (vBody.objects?.length > 0) {
            logger.warn(`[Square] Catalog not empty after wipe (${vBody.objects.length} remaining). Waiting more...`);
            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
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

    // 1. Create Categories individually
    for (const name of categoryNames) {
      try {
        await this.client.catalog.object.upsert({
          idempotencyKey: `seed_cat_${Date.now()}_${name.toLowerCase().replace(/\s+/g, '_')}`,
          object: {
            type: 'CATEGORY',
            id: `#${name.replace(/\s+/g, '')}`,
            categoryData: { name },
          },
        });
        logger.info(`[Square] Seeded category: ${name}`);
      } catch (error: any) {
        logger.error(`[Square] Failed to seed category ${name}:`, error.message);
      }
    }

    // 2. Fetch all categories to get their REAL Square IDs
    const catNameToRealId = new Map<string, string>();
    try {
        const response = (await this.client.catalog.list({
            types: 'CATEGORY',
        })) as any;
        const body = response.result || response.data || response;
        let cats = body.objects || [];
        if (cats.length === 0 && Array.isArray(body)) cats = body;
        
        cats.forEach((c: any) => {
            if (c.type === 'CATEGORY' && c.categoryData?.name) {
                catNameToRealId.set(c.categoryData.name, c.id);
            }
        });
        logger.info(`[Square] Mapped ${catNameToRealId.size} categories for item assignment.`);
    } catch (error: any) {
        logger.error(`[Square] Failed to fetch categories for mapping:`, error.message);
    }

    // 3. Create Items referencing the real Category IDs
    for (const item of itemConfigs) {
      const categoryId = catNameToRealId.get(item.category);
      try {
        await this.client.catalog.object.upsert({
          idempotencyKey: `seed_item_${Date.now()}_${item.name.toLowerCase().replace(/\s+/g, '_')}`,
          object: {
            type: 'ITEM',
            id: `#${item.name.replace(/\s+/g, '')}`,
            itemData: {
              name: item.name,
              description: item.description,
              categoryId,
              variations: [
                {
                  type: 'ITEM_VARIATION',
                  id: `#var${item.name.replace(/\s+/g, '')}`,
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
          },
        });
        logger.info(`[Square] Seeded item: ${item.name} (Category ID: ${categoryId || 'NONE'})`);
      } catch (error: any) {
        logger.error(`[Square] Failed to seed item ${item.name}:`, error.message);
      }
    }

    logger.info('[Square] Expanded catalog seeding complete.');
  }

  subscribeToOrders(callback: (order: any) => void) {
    logger.info(
      `[Square] Webhook subscription should be handled via controllers`,
    );
  }
}
