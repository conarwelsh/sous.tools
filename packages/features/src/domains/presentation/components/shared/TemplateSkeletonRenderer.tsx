"use client";

import React from "react";
import { View, Text, cn } from "@sous/ui";
import { LayoutNode, LayoutNodeType } from "../../types/presentation.types.js";

export interface TemplateSkeletonRendererProps {
  node: LayoutNode;
  isEditMode?: boolean;
  onSlotClick?: (slotId: string) => void;
  contentMap?: Record<string, React.ReactNode>;
  scale?: number;
}

/**
 * The core visualization engine for Layout Templates.
 * Translates the abstract JSON structure into a visual DOM representation.
 */
export function TemplateSkeletonRenderer({
  node,
  isEditMode = false,
  onSlotClick,
  contentMap = {},
  scale = 1,
}: TemplateSkeletonRendererProps) {
  const { type, children, styles, id, name } = node;

  // Apply scaling if provided
  const scaledStyles: React.CSSProperties = {
    ...styles,
    minHeight: node.type === 'container' || node.type === 'slot' 
      ? (styles.minHeight || 100) 
      : undefined,
    minWidth: node.type === 'container' || node.type === 'slot' 
      ? (styles.minWidth || 100) 
      : undefined,
  } as any;

  const handleClick = (e: React.MouseEvent) => {
    if (type === "slot" && id && onSlotClick) {
      e.stopPropagation();
      onSlotClick(id);
    }
  };

  const renderContent = () => {
    if (type === "slot" && id && contentMap[id]) {
      return contentMap[id];
    }

    if (type === "slot") {
      return (
        <View className="flex-1 items-center justify-center p-4">
          <Text className="text-zinc-700 font-black uppercase text-[10px] tracking-widest text-center">
            {name || "Empty Slot"}
          </Text>
          {id && (
            <Text className="text-zinc-800 font-mono text-[8px] mt-1">
              ID: {id}
            </Text>
          )}
        </View>
      );
    }

    return children?.map((child, index) => (
      <TemplateSkeletonRenderer
        key={`${child.type}-${child.id || index}`}
        node={child}
        isEditMode={isEditMode}
        onSlotClick={onSlotClick}
        contentMap={contentMap}
        scale={scale}
      />
    ));
  };

  const baseClasses = cn(
    "relative flex flex-col transition-all",
    type === "container" && "flex-1",
    type === "slot" && "flex-1 border-2 border-dashed border-zinc-800 bg-zinc-900/20 hover:border-sky-500/50 hover:bg-sky-500/5 cursor-pointer",
    type === "fixed" && "absolute",
    isEditMode && type === "container" && "border border-zinc-800/50 m-1",
    isEditMode && type === "slot" && "m-1"
  );

  return (
    <div
      style={scaledStyles}
      className={baseClasses}
      onClick={handleClick}
    >
      {/* Label for Edit Mode */}
      {isEditMode && (type === "container" || type === "fixed") && (
        <div className="absolute top-0 left-0 bg-zinc-800/80 px-1.5 py-0.5 rounded-br z-20 pointer-events-none">
          <span className="text-zinc-500 font-black uppercase text-[6px] tracking-tighter">
            {type}{name ? `: ${name}` : ''}
          </span>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
}
