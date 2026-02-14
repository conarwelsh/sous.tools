import { config } from "@sous/config";
import { DatabaseService } from "../apps/api/src/domains/core/database/database.service.js";
import {
  organizations,
  products,
} from "../apps/api/src/domains/core/database/schema.js";
import { eq } from "drizzle-orm";

async function checkProducts() {
  const dbService = new DatabaseService();
  await dbService.onModuleInit();

  const org = await dbService.db.query.organizations.findFirst({
    where: eq(organizations.slug, "chef-conar"),
  });

  if (!org) {
    console.log("Org chef-conar not found");
    return;
  }

  const allProducts = await dbService.db.query.products.findMany({
    where: eq(products.organizationId, org.id),
  });

  console.log(`Found ${allProducts.length} products for chef-conar`);
  allProducts.forEach((p) => console.log(`- ${p.name}`));
}

checkProducts();
