import { resolveConfig } from "@sous/config";
import { DatabaseService } from "../apps/api/src/domains/core/database/database.service.js";
import {
  organizations,
  integrationConfigs,
} from "../apps/api/src/domains/core/database/schema.js";
import { eq, and } from "drizzle-orm";
import { logger } from "@sous/logger";

async function findCreds() {
  await resolveConfig();
  const dbService = new DatabaseService();

  logger.info("🔍 Searching for Square credentials in DB...");

  const org = await dbService.db.query.organizations.findFirst({
    where: eq(organizations.slug, "sample-kitchen"),
  });

  if (!org) {
    logger.error("❌ Sample kitchen org not found");
    process.exit(1);
  }

  const config = await dbService.db.query.integrationConfigs.findFirst({
    where: and(
      eq(integrationConfigs.organizationId, org.id),
      eq(integrationConfigs.provider, "square"),
    ),
  });

  if (!config) {
    logger.error("❌ Square integration not found for sample kitchen");
    process.exit(1);
  }

  const creds = JSON.parse(config.encryptedCredentials);
  console.log("--- FOUND CREDENTIALS ---");
  console.log(`SQUARE_ACCESS_TOKEN=${creds.accessToken}`);
  console.log(`SQUARE_ENVIRONMENT=${creds.environment || "sandbox"}`);
  console.log("---------------------------");
}

findCreds();
