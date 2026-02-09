import * as React from "react";
import { cn } from "../../lib/utils";

const ScrollView = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("overflow-auto", className)} {...props} />
));
ScrollView.displayName = "ScrollView";

export { ScrollView };
