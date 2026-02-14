import { resolveConfig } from "@sous/config";
import { DatabaseService } from "../apps/api/src/domains/core/database/database.service.js";
import { integrationConfigs } from "../apps/api/src/domains/core/database/schema.js";
import { logger } from "@sous/logger";

async function listTokens() {
  await resolveConfig();
  const dbService = new DatabaseService();
  const configs = await dbService.db.query.integrationConfigs.findMany();
  console.log("--- TOKENS ---");
  configs.forEach((c) => {
    const creds = JSON.parse(c.encryptedCredentials);
    console.log(
      `- Provider: ${c.provider}, Org: ${c.organizationId}, Token: ${creds.accessToken?.slice(0, 10)}...`,
    );
  });
}

listTokens();
