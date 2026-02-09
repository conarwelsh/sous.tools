import * as React from "react";
import { cn } from "../../lib/utils";

export interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  asChild?: boolean;
}

const Text = React.forwardRef<HTMLSpanElement, TextProps>(
  ({ className, ...props }, ref) => {
    return <span ref={ref} className={cn("", className)} {...props} />;
  },
);
Text.displayName = "Text";

export { Text };
