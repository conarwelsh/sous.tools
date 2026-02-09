import * as React from "react";
import { cn } from "../../lib/utils";

export interface ViewProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const View = React.forwardRef<HTMLDivElement, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("flex flex-col", className)} {...props} />
    );
  },
);
View.displayName = "View";

export { View };
