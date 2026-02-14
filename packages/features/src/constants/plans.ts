export enum PlanType {
  COMMIS = "COMMIS",
  CHEF_DE_PARTIE = "CHEF_DE_PARTIE",
  EXECUTIVE_CHEF = "EXECUTIVE_CHEF",
  CUSTOM = "CUSTOM",
}

export enum FeatureScope {
  // PROCUREMENT
  PROCURE_INVOICE_CREATE = "procure:invoice:create",
  PROCURE_INVOICE_VIEW = "procure:invoice:view",
  PROCURE_ORDER_MANAGE = "procure:order:manage",

  // CULINARY
  CULINARY_RECIPE_CREATE = "culinary:recipe:create",
  CULINARY_RECIPE_AI_PARSE = "culinary:recipe:ai-parse",
  CULINARY_COOK_MODE = "culinary:cook-mode",

  // INTELLIGENCE
  INTEL_ANALYTICS_VIEW = "intel:analytics:view",
  INTEL_COSTING_ADVANCED = "intel:costing:advanced",

  // INVENTORY
  INVENTORY_VIEW = "inventory:view",
  INVENTORY_MANAGE = "inventory:manage",

  // HARDWARE
  HARDWARE_MANAGE = "hardware:manage",
  HARDWARE_REMOTE_CONTROL = "hardware:remote-control",

  // ADMIN
  ADMIN_USER_MANAGE = "admin:user:manage",
  ADMIN_BILLING_VIEW = "admin:billing:view",
}

export enum MetricKey {
  MAX_RECIPES = "max_recipes",
  MAX_USERS = "max_users",
  MAX_LOCATIONS = "max_locations",
  MAX_INVOICES_MONTHLY = "max_invoices_monthly",
}

export const ROLE_SCOPES: Record<string, FeatureScope[]> = {
  user: [FeatureScope.PROCURE_INVOICE_VIEW, FeatureScope.CULINARY_COOK_MODE],
  admin: [
    FeatureScope.PROCURE_INVOICE_CREATE,
    FeatureScope.PROCURE_INVOICE_VIEW,
    FeatureScope.PROCURE_ORDER_MANAGE,
    FeatureScope.CULINARY_RECIPE_CREATE,
    FeatureScope.CULINARY_RECIPE_AI_PARSE,
    FeatureScope.CULINARY_COOK_MODE,
    FeatureScope.ADMIN_USER_MANAGE,
    FeatureScope.ADMIN_BILLING_VIEW,
    FeatureScope.HARDWARE_MANAGE,
  ],
  superadmin: Object.values(FeatureScope),
};
