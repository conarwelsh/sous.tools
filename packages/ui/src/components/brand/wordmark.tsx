import React, { forwardRef } from 'react';
import { Logo } from './logo';
import { LogoProps } from './logo-types';

/**
 * Modern Wordmark branding component.
 */
export const Wordmark = forwardRef<any, LogoProps>((props, ref) => {
  return <Logo ref={ref} showWordmark={true} {...props} />;
});

Wordmark.displayName = 'Wordmark';
