import * as React from "react";
import { cn } from "../../lib/utils";

export interface ScrollViewProps extends React.HTMLAttributes<HTMLDivElement> {
  horizontal?: boolean;
  showsHorizontalScrollIndicator?: boolean;
}

const ScrollView: React.ForwardRefExoticComponent<
  ScrollViewProps & React.RefAttributes<HTMLDivElement>
> = React.forwardRef<
  HTMLDivElement,
  ScrollViewProps
>(({ className, horizontal, showsHorizontalScrollIndicator = true, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn(
      "overflow-auto", 
      horizontal ? "flex flex-row overflow-x-auto overflow-y-hidden" : "flex flex-col overflow-y-auto overflow-x-hidden",
      !showsHorizontalScrollIndicator && "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
      className
    )} 
    {...props} 
  />
));
ScrollView.displayName = "ScrollView";

export { ScrollView };
