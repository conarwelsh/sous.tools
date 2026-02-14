export interface Seeder {
  seedSystem(orgId?: string): Promise<string | void>;
  seedSample(orgId: string): Promise<void>;
}
