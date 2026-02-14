"use client";

import React from "react";
import { View, cn } from "@sous/ui";
import { TemplateStage } from "../../shared/TemplateStage";
import { TemplateSkeletonRenderer } from "../../shared/TemplateSkeletonRenderer";
import { useDraggable, useDroppable, useDndContext } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { LayoutNode } from "../../../types/presentation.types";

interface CanvasProps {
  structure: LayoutNode;
  contentMap: Record<string, React.ReactNode>;
  activeLayoutType: string;
  selectedNodeId?: string;
  isPreviewMode: boolean;
  onNodeClick: (node: LayoutNode) => void;
  onEditClick: (node: LayoutNode, tab: string) => void;
  onResize: (id: string, size: any, parentNode?: LayoutNode) => void;
}

// --- Internal Canvas Components ---

function DroppableNodeWrapper({
  node,
  children,
  onNodeClick,
  isSelected,
  activeLayoutType,
  onEditStyle,
  onEditData,
  isPreviewMode,
}: any) {
  const { setNodeRef, isOver, over } = useDroppable({
    id: (node as any)._internalId,
    disabled: node.type === "fixed" || isPreviewMode,
  });

  const { active } = useDndContext();
  const isFixed = node.type === "fixed";
  const isMovingFixed = active?.data.current?.isMove;
  const isTargeted =
    isOver && over?.id === (node as any)._internalId && !isMovingFixed;

  const hasToolbar = node.type !== "container" && !isPreviewMode;

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node);
      }}
      className={cn(
        "relative flex flex-col transition-all",
        !isPreviewMode && "min-h-[20px]",
        hasToolbar && "group/slot",
        !isFixed && "flex-1 w-full h-full",
        isTargeted && !isFixed && "bg-sky-500/10 ring-2 ring-sky-500 z-30",
        isSelected && !isPreviewMode && "ring-2 ring-sky-500 z-20",
      )}
    >
      {children}
    </div>
  );
}

// Note: SlotToolbar and ResizableWrapper are complex and would ideally be in their own files
// For this modularization pass, I'll keep them internal to Canvas or move them if they are too big.
// I will assume for now they are needed here.

function DesignerRenderer({
  node,
  parentNode,
  onNodeClick,
  onEditClick,
  onResize,
  selectedNodeId,
  isRoot,
  contentMap,
  activeLayoutType,
  isPreviewMode,
}: any) {
  const isSelected = selectedNodeId === (node as any)._internalId;
  const isFixed = node.type === "fixed";

  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id: `move-${(node as any)._internalId}`,
      data: { node, isMove: true },
      disabled: !isFixed || isPreviewMode,
    });

  const content = (
    <TemplateSkeletonRenderer
      node={node}
      isEditMode={!isPreviewMode}
      selectedNodeId={selectedNodeId}
      onEditClick={() => onEditClick(node, "style")}
      onNodeClick={onNodeClick}
      isRoot={isRoot}
      contentMap={contentMap}
      renderChildren={(children: LayoutNode[]) =>
        children.map((child) => (
          <DesignerRenderer
            key={(child as any)._internalId}
            node={child}
            parentNode={node}
            onNodeClick={onNodeClick}
            onEditClick={onEditClick}
            onResize={onResize}
            selectedNodeId={selectedNodeId}
            isRoot={false}
            contentMap={contentMap}
            activeLayoutType={activeLayoutType}
            isPreviewMode={isPreviewMode}
          />
        ))
      }
    />
  );

  return (
    <div
      ref={isFixed ? setNodeRef : undefined}
      {...(isFixed && !isPreviewMode ? listeners : {})}
      {...(isFixed && !isPreviewMode ? attributes : {})}
      className={cn(
        isFixed && "absolute z-50",
        !isFixed && "flex-1 w-full h-full",
        isDragging && "opacity-50",
      )}
      style={
        isFixed
          ? {
              left: node.styles.left,
              top: node.styles.top,
              width: node.styles.width,
              height: node.styles.height,
              transform: CSS.Translate.toString(transform),
            }
          : {}
      }
    >
      <DroppableNodeWrapper
        node={node}
        onNodeClick={onNodeClick}
        isSelected={isSelected}
        activeLayoutType={activeLayoutType}
        onEditStyle={() => onEditClick(node, "style")}
        onEditData={() => onEditClick(node, "data")}
        isPreviewMode={isPreviewMode}
      >
        {content}
      </DroppableNodeWrapper>
    </div>
  );
}

export const Canvas: React.FC<CanvasProps> = ({
  structure,
  contentMap,
  activeLayoutType,
  selectedNodeId,
  isPreviewMode,
  onNodeClick,
  onEditClick,
  onResize,
}) => {
  return (
    <View
      className="flex-1 relative bg-[#050505]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onNodeClick(null as any);
        }
      }}
    >
      <TemplateStage
        isEditMode={!isPreviewMode}
        className={cn(
          "template-stage shadow-[0_0_100px_rgba(0,0,0,0.5)]",
          !isPreviewMode && "border border-white/5",
        )}
      >
        <DesignerRenderer
          node={structure}
          parentNode={null}
          contentMap={contentMap}
          activeLayoutType={activeLayoutType}
          onNodeClick={onNodeClick}
          onEditClick={onEditClick}
          onResize={onResize}
          selectedNodeId={selectedNodeId}
          isRoot={true}
          isPreviewMode={isPreviewMode}
        />
      </TemplateStage>
    </View>
  );
};
