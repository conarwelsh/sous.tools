"use client";

import React from "react";
import { View, Text, cn } from "@sous/ui";
import { LayoutNode, LayoutNodeType } from "../../types/presentation.types";
import { Pencil } from "lucide-react";

export interface TemplateSkeletonRendererProps {
  node: LayoutNode;
  isEditMode?: boolean;
  onSlotClick?: (slotId: string) => void;
  onNodeClick?: (node: LayoutNode) => void;
  onEditClick?: (node: LayoutNode) => void;
  selectedNodeId?: string;
  isRoot?: boolean;
  contentMap?: Record<string, React.ReactNode>;
  scale?: number;
  renderChildren?: (children: LayoutNode[]) => React.ReactNode;
}

/**
 * The core visualization engine for Layout Templates.
 * Translates the abstract JSON structure into a visual DOM representation.
 */
export function TemplateSkeletonRenderer({
  node,
  isEditMode = false,
  onSlotClick,
  onNodeClick,
  onEditClick,
  selectedNodeId,
  isRoot = false,
  contentMap = {},
  scale = 1,
  renderChildren,
}: TemplateSkeletonRendererProps) {
  const { type, children, id, name } = node;
  const styles = node.styles || {};

  // Apply scaling and grid styles if provided
  const scaledStyles: React.CSSProperties = {
    ...styles,
    // Support grid layout
    display: styles.display || (type === 'container' ? 'flex' : undefined),
    gridTemplateColumns: styles.gridTemplateColumns,
    gridTemplateRows: styles.gridTemplateRows,
    gap: styles.gap,
    // Force full size for layout elements unless specified
    width: styles.width || ((type === "container" || type === "slot") ? "100%" : 'auto'),
    height: styles.height || ((type === "container" || type === "slot") ? "100%" : 'auto'),
    minWidth: type === 'fixed' ? (styles.minWidth || 120) : (styles.minWidth || (isEditMode ? 40 : 0)),
    minHeight: type === 'fixed' ? (styles.minHeight || 80) : (styles.minHeight || (isEditMode ? 40 : 0)),
    alignSelf: 'stretch',
    justifySelf: 'stretch',
    // Fixed positioning
    position: type === 'fixed' ? 'absolute' : 'relative',
    left: type === 'fixed' ? (styles.left || '10%') : undefined,
    top: type === 'fixed' ? (styles.top || '10%') : undefined,
    zIndex: type === 'fixed' ? 100 : undefined,
    // Scaling
    transform: scale !== 1 ? `scale(${scale})` : undefined,
    transformOrigin: 'top left',
  } as any;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === "slot" && id && onSlotClick) {
      onSlotClick(id);
    }
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onEditClick) {
      onEditClick(node);
    }
  };

  // Helper to get count of rows/cols for grid visualization
  const getGridCount = (template?: string) => {
    if (!template || typeof template !== 'string') return 1;
    return template.trim().split(/\s+/).length;
  };

  const renderContent = () => {
    if (!node) return null;

    if (type === "slot" && id && contentMap[id]) {
      return contentMap[id];
    }

    let childrenContent = null;

    if (renderChildren && children) {
      childrenContent = renderChildren(children);
    } else if (children) {
      childrenContent = children.map((child, index) => (
        <TemplateSkeletonRenderer
          key={(child as any)._internalId || `${child.type}-${child.id || index}`}
          node={child}
          isEditMode={isEditMode}
          onSlotClick={onSlotClick}
          onNodeClick={onNodeClick}
          onEditClick={onEditClick}
          selectedNodeId={selectedNodeId}
          contentMap={contentMap}
          scale={scale}
        />
      ));
    }

    if (type === "slot") {
      return (
        <View className="flex-1 relative">
          <View className="absolute inset-0 items-center justify-center p-4 pointer-events-none">
            <Text className="text-muted-foreground/50 font-black uppercase text-[10px] tracking-widest text-center">
              {name || "Empty Slot"}
            </Text>
            {id && (
              <Text className="text-muted-foreground/30 font-mono text-[8px] mt-1">
                ID: {id}
              </Text>
            )}
          </View>
          {childrenContent}
        </View>
      );
    }

    return childrenContent;
  };

  const isSelected = selectedNodeId && (id === selectedNodeId || (node as any)._internalId === selectedNodeId);

  const baseClasses = cn(
    "relative flex flex-col transition-all",
    (type === "container" || type === "slot") && "flex-1 w-full h-full",
    styles.display === 'grid' && "layout-grid-container",
    type === "slot" && "border-2 border-dashed border-border bg-muted/20 hover:border-primary/50 hover:bg-primary/5 cursor-pointer",
    type === "fixed" && "border-2 border-primary/30 bg-card shadow-2xl rounded-lg overflow-hidden",
    isEditMode && type === "container" && "border border-border/50 p-1 cursor-pointer hover:border-primary/30",
    isEditMode && type === "slot" && "p-1",
    isSelected && "ring-2 ring-primary z-50 bg-primary/10 shadow-[0_0_25px_rgba(14,165,233,0.4)]"
  );

  return (
    <div
      style={scaledStyles}
      className={baseClasses}
      onClick={handleClick}
    >
      {/* Grid Helper Lines for Edit Mode */}
      {isEditMode && type === 'container' && styles.display === 'grid' && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10 z-0" 
          style={{
            display: 'grid',
            gridTemplateColumns: styles.gridTemplateColumns as string,
            gridTemplateRows: styles.gridTemplateRows as string,
            gap: styles.gap as any,
          }}
        >
          {Array.from({ 
            length: getGridCount(styles.gridTemplateColumns as string) * getGridCount(styles.gridTemplateRows as string) 
          }).map((_, i) => (
            <div key={i} className="border border-primary min-h-[40px] min-w-[40px]" />
          ))}
        </div>
      )}

      {/* Label for Edit Mode */}
      {isEditMode && !isRoot && (
        <div className="absolute top-0 left-0 bg-muted/80 px-1.5 py-0.5 rounded-br z-20 pointer-events-none flex flex-row items-center gap-1.5">
          <span className="text-muted-foreground font-black uppercase text-[6px] tracking-tighter">
            {type === 'container' ? (styles.display === 'grid' ? 'grid' : 'flex') : type}{name ? `: ${name}` : ''}
          </span>
        </div>
      )}

      {/* Resize Handles & Controls for Edit Mode */}
      {isEditMode && !isRoot && (
        <>
          {/* Edit Icon */}
          <button 
            onClick={handleEdit}
            className="absolute top-1 right-1 w-5 h-5 bg-muted hover:bg-primary rounded flex items-center justify-center z-30 transition-colors border border-border"
          >
            <Pencil size={10} className="text-foreground group-hover:text-primary-foreground" />
          </button>
        </>
      )}
      
      {renderContent()}
    </div>
  );
}
