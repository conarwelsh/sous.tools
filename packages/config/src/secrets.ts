import { logger } from "@sous/logger";

export interface Secret {
  key: string;
  value: string;
}

export interface InfisicalCredentials {
  clientId: string;
  clientSecret: string;
  projectId: string;
}

export class SecretManager {
  private client: any = null;
  private isInitialized = false;
  private _credentials: InfisicalCredentials | null = null;

  constructor(credentials?: InfisicalCredentials) {
    if (credentials) {
      this._credentials = credentials;
    }
  }

  private get credentials(): InfisicalCredentials {
    if (this._credentials) return this._credentials;

    return {
      clientId: process.env.INFISICAL_CLIENT_ID || "",
      clientSecret: process.env.INFISICAL_CLIENT_SECRET || "",
      projectId: process.env.INFISICAL_PROJECT_ID || "",
    };
  }

  private async ensureInitialized() {
    if (this.isInitialized) return;

    const { clientId, clientSecret, projectId } = this.credentials;

    if (!clientId || !clientSecret || !projectId) {
      throw new Error(
        "Missing Infisical bootstrap credentials (INFISICAL_CLIENT_ID, INFISICAL_CLIENT_SECRET, INFISICAL_PROJECT_ID)"
      );
    }

    try {
      const { InfisicalSDK } = await import("@infisical/sdk");
      this.client = new InfisicalSDK();
      await this.client.auth().universalAuth.login({
        clientId,
        clientSecret,
      });
      this.isInitialized = true;
    } catch (e: any) {
      logger.error(`❌ Failed to initialize Infisical SDK: ${e.message}`);
      throw e;
    }
  }

  private mapEnv(env: string): string {
    switch (env.toLowerCase()) {
      case "development":
      case "dev":
        return "dev";
      case "staging":
        return "staging";
      case "production":
      case "prod":
        return "prod";
      default:
        return env;
    }
  }

  async listSecrets(env: string): Promise<Record<string, string>> {
    await this.ensureInitialized();
    const infisicalEnv = this.mapEnv(env);
    
    const response = await this.client.secrets().listSecrets({
      environment: infisicalEnv,
      projectId: this.credentials.projectId,
    });

    return response.secrets.reduce((acc: Record<string, string>, s: any) => {
      acc[s.secretKey] = s.secretValue;
      return acc;
    }, {});
  }

  async upsertSecret(key: string, value: string, env: string): Promise<void> {
    await this.ensureInitialized();
    const infisicalEnv = this.mapEnv(env);
    const projectId = this.credentials.projectId;

    try {
      // Check if secret exists
      await this.client.secrets().getSecret({
        environment: infisicalEnv,
        projectId,
        secretName: key,
        secretPath: "/",
        type: "shared" as any,
      });
      
      // Update existing
      await this.client.secrets().updateSecret(key, {
        environment: infisicalEnv,
        projectId,
        secretValue: value,
        secretPath: "/",
        type: "shared" as any,
      });
      logger.info(`✅ Updated secret ${key} in ${env}`);
    } catch (e) {
      // Create new
      await this.client.secrets().createSecret(key, {
        environment: infisicalEnv,
        projectId,
        secretValue: value,
        secretPath: "/",
        type: "shared" as any,
      });
      logger.info(`✅ Created secret ${key} in ${env}`);
    }
  }
}
