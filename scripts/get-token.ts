import { resolveConfig } from "@sous/config";
import { DatabaseService } from "../apps/api/src/domains/core/database/database.service.js";
import { integrationConfigs } from "../apps/api/src/domains/core/database/schema.js";
import { eq, and } from "drizzle-orm";

async function getFullToken() {
  await resolveConfig();
  const dbService = new DatabaseService();
  const config = await dbService.db.query.integrationConfigs.findFirst({
    where: and(
      eq(
        integrationConfigs.organizationId,
        "4c36d045-3c8c-48e5-9d59-849e2b58e427",
      ),
      eq(integrationConfigs.provider, "square"),
    ),
  });
  if (config) {
    const creds = JSON.parse(config.encryptedCredentials);
    console.log(`TOKEN=${creds.accessToken}`);
    console.log(`ENV=${creds.environment || "sandbox"}`);
  }
}
getFullToken();
