import * as React from 'react';
import { TextInput, View } from 'react-native';
import { cn } from '../../lib/utils';

interface InputProps extends React.ComponentPropsWithoutRef<typeof TextInput> {
  label?: string;
  error?: string;
  className?: string;
}

const Input = React.forwardRef<TextInput, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    const TextInputAny = TextInput as any;
    const ViewAny = View as any;

    return (
      <ViewAny className="w-full space-y-2">
        {label && (
          <ViewAny className="text-sm font-medium text-zinc-400 px-1 uppercase tracking-widest text-[10px]">
            {label}
          </ViewAny>
        )}
        <TextInputAny
          ref={ref}
          placeholderTextColor="#71717a"
          className={cn(
            'flex h-10 w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500',
            className
          )}
          {...props}
        />
        {error && (
          <ViewAny className="text-xs text-red-500 px-1">
            {error}
          </ViewAny>
        )}
      </ViewAny>
    );
  }
);
Input.displayName = 'Input';

export { Input };
