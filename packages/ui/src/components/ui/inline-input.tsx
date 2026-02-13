import * as React from "react";
import { cn } from "../../utils/cn";

export interface InlineInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange?: (value: string) => void;
}

const InlineInput = React.forwardRef<HTMLInputElement, InlineInputProps>(
  ({ className, type, onValueChange, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 focus:bg-muted/30 rounded px-1 transition-colors hover:bg-muted/20 cursor-text font-inherit text-inherit",
          className
        )}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
InlineInput.displayName = "InlineInput";

export interface InlineTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onValueChange?: (value: string) => void;
}

const InlineTextArea = React.forwardRef<HTMLTextAreaElement, InlineTextAreaProps>(
  ({ className, onValueChange, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 focus:bg-muted/30 rounded px-1 transition-colors hover:bg-muted/20 cursor-text font-inherit text-inherit resize-none",
          className
        )}
        onChange={(e) => {
          props.onChange?.(e);
          onValueChange?.(e.target.value);
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
InlineTextArea.displayName = "InlineTextArea";

export { InlineInput, InlineTextArea };
