import * as React from 'react';
import { Text as RNText } from 'react-native';
import { cn } from '../../lib/utils.js';

interface TypographyProps extends React.ComponentPropsWithoutRef<typeof RNText> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead' | 'large' | 'small' | 'muted';
  className?: string;
}

const Typography = React.forwardRef<any, TypographyProps>(
  ({ className, variant = 'p', ...props }, ref) => {
    const TextAny = RNText as any;

    const variants = {
      h1: 'scroll-m-20 text-4xl font-brand font-black tracking-tighter lg:text-5xl text-white',
      h2: 'scroll-m-20 border-b border-zinc-800 pb-2 text-3xl font-brand font-black tracking-tight first:mt-0 text-white',
      h3: 'scroll-m-20 text-2xl font-brand font-bold tracking-tight text-white',
      h4: 'scroll-m-20 text-xl font-brand font-semibold tracking-tight text-white',
      p: 'leading-7 text-zinc-400 [&:not(:first-child)]:mt-6',
      lead: 'text-xl text-zinc-500 font-medium',
      large: 'text-lg font-semibold text-white',
      small: 'text-sm font-medium leading-none text-zinc-400',
      muted: 'text-sm text-zinc-500',
    };

    return (
      <TextAny
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      />
    );
  }
);
Typography.displayName = 'Typography';

export { Typography };
