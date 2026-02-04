import { LogoEnvironment } from './logo-types';

/**
 * Maps environment to brand colors using CSS variables.
 */
export const getEnvColor = (environment: LogoEnvironment = 'production') => {
  switch (environment) {
    case 'dev':
      return 'hsl(var(--success))';
    case 'staging':
      return 'hsl(var(--warning))';
    case 'production':
    default:
      return 'hsl(var(--primary))';
  }
};

/**
 * Maps environment to muted brand colors for backgrounds.
 */
export const getMutedEnvColor = (
  environment: LogoEnvironment = 'production',
) => {
  switch (environment) {
    case 'dev':
      return 'hsl(var(--success) / 0.1)';
    case 'staging':
      return 'hsl(var(--warning) / 0.1)';
    case 'production':
    default:
      return 'hsl(var(--primary) / 0.1)';
  }
};
