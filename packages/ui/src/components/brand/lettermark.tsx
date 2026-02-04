import React, { forwardRef } from 'react';
import { Logo } from './logo';
import { LogoProps } from './logo-types';

/**
 * Modern Lettermark branding component.
 */
export const Lettermark = forwardRef<any, LogoProps>((props, ref) => {
  return <Logo ref={ref} showWordmark={false} {...props} />;
});

Lettermark.displayName = 'Lettermark';
