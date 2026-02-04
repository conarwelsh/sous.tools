import React from 'react';
import { SvgProps } from 'react-native-svg';

export type LogoVariant = string;
export type LogoDetailLevel = 'low' | 'medium' | 'high';
export type LogoEnvironment = 'production' | 'staging' | 'dev';

export interface LogoProps extends SvgProps {
  variant?: LogoVariant;
  isAnimated?: boolean;
  isLoading?: boolean;
  isSquare?: boolean;
  showWordmark?: boolean;
  showTagline?: boolean;
  detailLevel?: LogoDetailLevel;
  environment?: LogoEnvironment;
  size?: number | string;
  wordmark?: string;
  tagline?: string;
  /** @deprecated Use detailLevel="low" instead */
  simplified?: boolean;
}

/**
 * Interface for a Logo Variant component.
 */
export type LogoVariantComponent = React.FC<LogoProps>;

/**
 * Registry definition for a logo variant.
 */
export interface LogoVariantDefinition {
  id: LogoVariant;
  name: string;
  component: LogoVariantComponent;
}
