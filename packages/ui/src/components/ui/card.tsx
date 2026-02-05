import * as React from 'react';
import { View } from './view.js';
import { Text } from './text.js';
import { cn } from '../../lib/utils.js';

interface CardProps extends React.ComponentPropsWithoutRef<typeof View> {
  className?: string;
}

const Card = React.forwardRef<any, CardProps>(
  ({ className, ...props }, ref) => {
    const ViewAny = View as any;
    return (
      <ViewAny
        ref={ref}
        className={cn('rounded-3xl border border-zinc-800 bg-zinc-950/50', className)}
        {...props}
      />
    );
  }
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<any, CardProps>(
  ({ className, ...props }, ref) => {
    const ViewAny = View as any;
    return (
      <ViewAny
        ref={ref}
        className={cn('flex flex-col space-y-1.5 p-6', className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => {
    const TextAny = Text as any;
    return (
      <TextAny
        ref={ref}
        className={cn('font-brand font-black text-2xl leading-none tracking-tight text-white', className)}
        {...props}
      />
    );
  }
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<any, any>(
  ({ className, ...props }, ref) => {
    const TextAny = Text as any;
    return (
      <TextAny
        ref={ref}
        className={cn('text-sm text-zinc-500 font-medium', className)}
        {...props}
      />
    );
  }
);
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef<any, CardProps>(
  ({ className, ...props }, ref) => {
    const ViewAny = View as any;
    return (
      <ViewAny ref={ref} className={cn('p-6 pt-0', className)} {...props} />
    );
  }
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<any, CardProps>(
  ({ className, ...props }, ref) => {
    const ViewAny = View as any;
    return (
      <ViewAny
        ref={ref}
        className={cn('flex items-center p-6 pt-0', className)}
        {...props}
      />
    );
  }
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };