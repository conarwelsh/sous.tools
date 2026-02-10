"use client";

import React from "react";
import { View, cn } from "@sous/ui";

export interface TemplateStageProps {
  children: React.ReactNode;
  className?: string;
  isEditMode?: boolean;
}

/**
 * A shared, standardized container that occupies the full occupancy of its parent.
 * Provides the "Full Screen Context" for Layout, Screen, and Label managers.
 */
export function TemplateStage({
  children,
  className,
  isEditMode = false,
}: TemplateStageProps) {
  return (
    <View
      className={cn(
        "flex-1 w-full h-full min-h-screen relative overflow-hidden bg-black",
        isEditMode && "bg-[#050505]",
        className
      )}
    >
      {/* Background Grid Pattern for Edit Mode */}
      {isEditMode && (
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      )}
      
      <div className="flex-1 w-full h-full flex flex-col relative z-10">
        {children}
      </div>
    </View>
  );
}
