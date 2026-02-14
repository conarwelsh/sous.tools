import { SecretManager, parseBootstrapEnv } from '@sous/config/server-utils';

/**
 * Automatically loads secrets from Infisical if bootstrap credentials are present.
 * This ensures the CLI has access to the full configuration without needing 'env exec'.
 */
export async function loadInfisicalEnv() {
  // If we are already inside an 'env exec' context, skip
  if (process.env.SOUS_ENV_INJECTED === 'true') {
    return;
  }

  try {
    // 1. Try to parse bootstrap credentials
    const bootstrap = parseBootstrapEnv();
    if (!bootstrap.INFISICAL_CLIENT_ID) return;

    // 2. Determine target environment
    const envName = process.env.NODE_ENV || 'development';

    // 3. Initialize SecretManager
    const secrets = new SecretManager({
      clientId: bootstrap.INFISICAL_CLIENT_ID,
      clientSecret: bootstrap.INFISICAL_CLIENT_SECRET,
      projectId: bootstrap.INFISICAL_PROJECT_ID,
    });

    // 4. Fetch secrets
    const vaultSecrets = await secrets.listSecrets(envName);
    const keys = Object.keys(vaultSecrets);

    // 5. Inject into process.env
    Object.assign(process.env, vaultSecrets);

    // Mark as injected to avoid double loading
    process.env.SOUS_ENV_INJECTED = 'true';
  } catch (e: any) {
    console.error(`❌ Failed to load secrets from Infisical: ${e.message}`);
    process.exit(1);
  }
}
