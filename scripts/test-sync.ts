import { config } from '@sous/config';
import { logger } from '@sous/logger';
import path from 'path';

const squareDriverPath = path.resolve(
  "apps/api/src/domains/integrations/drivers/square.driver.ts",
);

async function test() {
  logger.info(`🌐 Environment: ${config.env}`);
  
  const { SquareDriver } = await import(squareDriverPath);

  if (!config.square.accessToken) {
    logger.error('❌ Square access token is missing from config');
    logger.info('Current square config:', JSON.stringify(config.square, null, 2));
    process.exit(1);
  }

  logger.info(
    `🧪 Testing Square Integration (${config.square.environment})...`,
  );
  logger.info(`📱 Application ID: ${config.square.applicationId || "MISSING"}`);
  logger.info(
    `🔑 Token Status: ${config.square.accessToken ? "PRESENT" : "MISSING"}`,
  );

  const driver = new SquareDriver({
    accessToken: config.square.accessToken,
    environment: config.square.environment,
  });

  try {
    // 1. Seed Catalog (which now includes a full wipe)
    logger.info("🌱 Seeding catalog...");
    await driver.seedCatalog();

    // 2. Fetch Catalog
    logger.info("🔍 Fetching catalog back from Square...");
    const catalog = await driver.fetchCatalog();

    const categories = catalog.filter((c: any) => c.type === "CATEGORY");
    const items = catalog.filter((c: any) => c.type === "ITEM");

    logger.info(
      `✅ Found ${categories.length} categories and ${items.length} items.`,
    );

    // 3. Verify Associations
    let linkedCount = 0;
    for (const item of items) {
      if (item.categoryId) {
        const cat = categories.find((c: any) => c.id === item.categoryId);
        if (cat) {
          logger.info(
            `🔗 Item "${item.name}" is correctly linked to category "${cat.name}"`,
          );
          linkedCount++;
        } else {
          logger.warn(
            `⚠️ Item "${item.name}" has categoryId ${item.categoryId} but category not found in list`,
          );
        }
      } else {
        logger.warn(`❌ Item "${item.name}" has NO categoryId`);
      }
    }

    if (linkedCount === items.length && items.length > 0) {
      logger.info(
        "🚀 SUCCESS: All items are correctly associated with categories!",
      );
    } else if (items.length === 0) {
      logger.error("❌ FAIL: No items found in catalog");
    } else {
      logger.error(
        `❌ FAIL: Only ${linkedCount}/${items.length} items were correctly linked`,
      );
    }
  } catch (error: any) {
    logger.error("❌ Test failed with error:", error.message);
    if (error.errors) logger.error(JSON.stringify(error.errors, null, 2));
    process.exit(1);
  }
}

test();
