import * as React from 'react';
import { Pressable, Text, View } from 'react-native';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ComponentPropsWithoutRef<typeof Pressable> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
  labelClasses?: string;
  className?: string;
}

const Button = React.forwardRef<View, ButtonProps>(
  ({ className, variant = 'default', size = 'default', label, labelClasses, children, ...props }, ref) => {
    const variants = {
      default: 'bg-primary',
      destructive: 'bg-destructive',
      outline: 'border border-input bg-background',
      secondary: 'bg-secondary',
      ghost: '',
      link: '',
    };

    const sizes = {
      default: 'h-10 px-4 py-2',
      sm: 'h-9 px-3',
      lg: 'h-11 px-8',
      icon: 'h-10 w-10',
    };

    const textVariants = {
      default: 'text-primary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      secondary: 'text-secondary-foreground',
      ghost: 'text-foreground',
      link: 'text-primary underline',
    };

    return (
      <Pressable
        ref={ref}
        // @ts-ignore
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {label ? (
          // @ts-ignore
          <Text className={cn(textVariants[variant], labelClasses)}>
            {label}
          </Text>
        ) : (
          children
        )}
      </Pressable>
    );
  }
);
Button.displayName = 'Button';

export { Button };