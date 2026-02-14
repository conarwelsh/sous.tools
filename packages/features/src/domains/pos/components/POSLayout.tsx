import React from "react";

export const POSLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 flex flex-row h-screen bg-[#050505] overflow-hidden text-foreground selection:bg-primary/30">
      {children}
    </div>
  );
};
