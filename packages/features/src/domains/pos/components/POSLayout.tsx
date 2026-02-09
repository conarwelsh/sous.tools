import React from "react";

export const POSLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex-1 flex flex-row h-screen bg-[#0a0a0a] overflow-hidden">
      {children}
    </div>
  );
};
