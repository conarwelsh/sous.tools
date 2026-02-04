import { LogoVariantDefinition } from './logo-types';
import { NeonLogo } from './variants/neon';
import { PlateLogo } from './variants/plate';
import { LinkLogo } from './variants/link';
import { DotLogo } from './variants/dot';

/**
 * Registry of all available logo designs.
 */
export const LOGO_REGISTRY: Record<string, LogoVariantDefinition> = {
  neon: {
    id: 'neon',
    name: 'Neon (Standard)',
    component: NeonLogo,
  },
  plate: {
    id: 'plate',
    name: 'Plate (High Scalability)',
    component: PlateLogo,
  },
  link: {
    id: 'link',
    name: 'Link (Geometric)',
    component: LinkLogo,
  },
  dot: {
    id: 'dot',
    name: 'Dot (Digital)',
    component: DotLogo,
  },
};

/**
 * Register a new logo variant dynamically.
 */
export function registerLogoVariant(definition: LogoVariantDefinition) {
  LOGO_REGISTRY[definition.id] = definition;
}