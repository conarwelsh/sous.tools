import { config } from "@sous/config";
import { DatabaseService } from "../apps/api/src/domains/core/database/database.service.js";
import { organizations } from "../apps/api/src/domains/core/database/schema.js";

async function listOrgs() {
  const dbService = new DatabaseService();
  await dbService.onModuleInit();
  const orgs = await dbService.db.query.organizations.findMany();
  console.log("--- ORGANIZATIONS ---");
  orgs.forEach((o) => console.log(`- ${o.name} (${o.slug})`));
}

listOrgs();
