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
        locationIds: [],
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

      const sqCategories = objects.filter(
        (obj: any) => obj.type === 'CATEGORY',
      );
      const catNameToId = new Map(
        sqCategories.map((c: any) => [c.categoryData?.name, c.id]),
      );

      // Fallback map for Sandbox consistency if linking fails
      const itemToCatName: Record<string, string> = {
        'Truffle Parmesan Fries': 'Appetizers',
        'Sous Signature Burger': 'Main Courses',
        'Honey Glazed Sprouts': 'Sides',
        'Local Craft IPA': 'Beverages',
        'Smoked Old Fashioned': 'Cocktails',
        'NY Style Cheesecake': 'Desserts',
        'Nitro Cold Brew': 'Beverages',
        'Margherita Pizza': 'Main Courses',
      };

      const catalogItems = objects.flatMap((obj: any) => {
        if (obj.type === 'CATEGORY') {
          return {
            type: 'CATEGORY',
            id: obj.id,
            name: obj.categoryData?.name,
          };
        } else if (obj.type === 'ITEM') {
          let categoryId = obj.itemData?.categoryId;

          // Robust Fallback: link by name if ID missing
          if (
            !categoryId &&
            obj.itemData?.name &&
            itemToCatName[obj.itemData.name]
          ) {
            categoryId = catNameToId.get(itemToCatName[obj.itemData.name]);
          }

          return {
            type: 'ITEM',
            id: obj.id,
            name: obj.itemData?.name,
            categoryId,
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
      const response = (await this.client.inventory.batchGetCounts({})) as any;
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
          id: `#${name.replace(/\s+/g, '')}`,
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

  async createProduct(data: {
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
          id: `#item_${data.name.replace(/\s+/g, '')}`,
          itemData: {
            name: data.name,
            description: data.description,
            categoryId: data.categoryId,
            variations: [
              {
                type: 'ITEM_VARIATION',
                id: `#var_${data.name.replace(/\s+/g, '')}`,
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
      logger.error(`[Square] Failed to create product ${data.name}:`, error);
      throw error;
    }
  }

  async updateProduct(productId: string, productData: any) {
    try {
      const response = (await this.client.catalog.object.upsert({
        idempotencyKey: `update_${Date.now()}_${productId}`,
        object: {
          ...productData,
          id: productId,
        },
      })) as any;
      const body = response.result || response.data || response;
      return body.catalogObject;
    } catch (error) {
      logger.error(`[Square] Failed to update product ${productId}:`, error);
      throw error;
    }
  }

  async deleteProduct(productId: string) {
    try {
      await this.client.catalog.object.delete({ objectId: productId });
      return { success: true };
    } catch (error) {
      logger.error(`[Square] Failed to delete product ${productId}:`, error);
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
      const response = (await this.client.catalog.list()) as any;
      const body = response.result || response.data || response;
      let objects = body.objects || [];
      if (objects.length === 0 && Array.isArray(body)) objects = body;

      const idsToDelete = objects.map((obj: any) => obj.id);

      if (idsToDelete.length > 0) {
        logger.info(
          `[Square] Deleting ${idsToDelete.length} existing catalog objects...`,
        );

        for (let i = 0; i < idsToDelete.length; i += 200) {
          const batch = idsToDelete.slice(i, i + 200);
          await this.client.catalog.batchDelete({
            objectIds: batch,
          });
        }

        // Essential delay for Square Sandbox consistency
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    } catch (error: any) {
      logger.warn('[Square] Pre-seed wipe failed or was empty:', error.message);
    }

    const categoryConfigs = [
      { name: 'Appetizers', id: '#cat_appetizers' },
      { name: 'Main Courses', id: '#cat_mains' },
      { name: 'Sides', id: '#cat_sides' },
      { name: 'Beverages', id: '#cat_bevs' },
      { name: 'Cocktails', id: '#cat_cocktails' },
      { name: 'Desserts', id: '#cat_desserts' },
    ];

    const itemConfigs = [
      {
        name: 'Truffle Parmesan Fries',
        price: 1200,
        categoryName: 'Appetizers',
        description:
          'Hand-cut fries tossed in white truffle oil and fresh parmesan.',
      },
      {
        name: 'Sous Signature Burger',
        price: 1800,
        categoryName: 'Main Courses',
        description:
          'Double wagyu beef, aged cheddar, caramelised onions, brioche.',
      },
      {
        name: 'Honey Glazed Sprouts',
        price: 900,
        categoryName: 'Sides',
        description: 'Crispy brussels sprouts with spicy honey and pancetta.',
      },
      {
        name: 'Local Craft IPA',
        price: 800,
        categoryName: 'Beverages',
        description: 'Rotating seasonal IPA from the valley.',
      },
      {
        name: 'Smoked Old Fashioned',
        price: 1600,
        categoryName: 'Cocktails',
        description: 'Bourbon, maple, walnut bitters, cherry wood smoke.',
      },
      {
        name: 'NY Style Cheesecake',
        price: 1000,
        categoryName: 'Desserts',
        description:
          'Velvety smooth with a graham cracker crust and berry coulis.',
      },
      {
        name: 'Nitro Cold Brew',
        price: 600,
        categoryName: 'Beverages',
        description: 'Velvety smooth nitrogen-infused coffee.',
      },
      {
        name: 'Margherita Pizza',
        price: 2200,
        categoryName: 'Main Courses',
        description:
          'San Marzano tomatoes, fresh mozzarella, basil, extra virgin olive oil.',
      },
    ];

    // 2. Create Categories sequentially and map their REAL Square IDs
    const catIdMap = new Map<string, string>();
    for (const cat of categoryConfigs) {
      try {
        const response = (await this.client.catalog.object.upsert({
          idempotencyKey: `seed_cat_${Date.now()}_${cat.name.replace(/\s+/g, '')}`,
          object: {
            type: 'CATEGORY',
            id: cat.id,
            categoryData: { name: cat.name },
          },
        })) as any;
        const body = response.result || response.data || response;
        const realId = body.catalogObject.id;
        catIdMap.set(cat.name, realId);
        logger.info(
          `[Square] Seeded category: ${cat.name} (Real ID: ${realId})`,
        );
      } catch (error: any) {
        logger.error(
          `[Square] Failed to seed category ${cat.name}:`,
          error.message,
        );
      }
    }

    // 3. Create Items sequentially referencing the real Category IDs
    for (const item of itemConfigs) {
      const categoryId = catIdMap.get(item.categoryName);
      try {
        await this.createProduct({
          name: item.name,
          price: item.price,
          categoryId,
          description: item.description,
        });
        logger.info(
          `[Square] Seeded item: ${item.name} (Linked to Category ID: ${categoryId})`,
        );
      } catch (error: any) {
        logger.error(
          `[Square] Failed to seed item ${item.name}:`,
          error.message,
        );
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
