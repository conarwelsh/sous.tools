import { resolveConfig } from "@sous/config";
import { DatabaseService } from "../apps/api/src/domains/core/database/database.service.js";
import { organizations } from "../apps/api/src/domains/core/database/schema.js";
import { logger } from "@sous/logger";

async function listOrgs() {
  await resolveConfig();
  const dbService = new DatabaseService();
  const orgs = await dbService.db.query.organizations.findMany();
  console.log("--- ORGANIZATIONS ---");
  orgs.forEach((o) => console.log(`- ${o.name} (${o.slug})`));
}

listOrgs();
