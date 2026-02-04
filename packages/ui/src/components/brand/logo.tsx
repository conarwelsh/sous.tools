import React, { forwardRef } from 'react';
import { Svg, Rect, G } from 'react-native-svg';
import { LogoProps } from './logo-types';
import { LOGO_REGISTRY } from './logo-registry';
import { NeonLogo } from './variants/neon';
import { cn } from '../../lib/utils';
import { getMutedEnvColor } from './logo-utils';

/**
 * Unified Logo component for Sous Tools.
 * Dispatches to registered variants or defaults to Neon.
 * Handles "Square Mode" (App Icon) wrapper.
 */
export const Logo = forwardRef<any, LogoProps>(
  (
    {
      variant = 'neon',
      isSquare = false,
      isAnimated = false,
      isLoading = false,
      showWordmark,
      showTagline,
      detailLevel,
      environment = 'production',
      size = 64,
      wordmark,
      tagline,
      simplified,
      style,
      className,
      ...props
    },
    ref,
  ) => {
    // 1. Resolve dimensions
    const bgColor = getMutedEnvColor(environment);

    // 2. Resolve variant from registry
    const definition = LOGO_REGISTRY[variant] || LOGO_REGISTRY['neon'];
    const Component = definition?.component || NeonLogo;

    const commonProps = {
      isAnimated,
      isLoading,
      environment,
      wordmark,
      tagline,
      simplified,
      detailLevel,
    };

    // 3. Render
    if (isSquare) {
      return (
        <Svg
          viewBox="0 0 512 512"
          fill="none"
          className={cn('overflow-visible', className)}
          width={size}
          height={size}
          {...props}
        >
          <Rect width="512" height="512" rx="128" fill={bgColor} />

          {/* Centered Lettermark / Icon portion */}
          <G x="106" y="60">
            <Component
              {...commonProps}
              showWordmark={false}
              showTagline={false}
              size={300}
            />
          </G>

          {/* Wordmark portion at the bottom */}
          <G x="106" y="400">
            <Component
              {...commonProps}
              showWordmark={true}
              showTagline={false}
              detailLevel="low"
              size={80}
            />
          </G>
        </Svg>
      );
    }

    return (
      <Component
        variant={variant}
        className={className}
        style={style}
        showWordmark={showWordmark}
        showTagline={showTagline}
        size={size}
        {...commonProps}
        {...props}
      />
    );
  },
);

Logo.displayName = 'Logo';
