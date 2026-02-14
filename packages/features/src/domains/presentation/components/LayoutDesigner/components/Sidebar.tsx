"use client";

import React from "react";
import { View, Text, Button, Card, cn } from "@sous/ui";
import {
  ChevronLeft,
  Grid3X3,
  Square,
  Layers,
  Maximize,
  Code,
  Trash2,
  Pencil,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutNode,
  LayoutNodeType,
  Layout,
} from "../../../types/presentation.types";

interface SidebarProps {
  layout: Partial<Layout>;
  selectedNodeId?: string;
  onCancel: () => void;
  onSelectNode: (node: LayoutNode) => void;
  onEditNode: (node: LayoutNode, tab: string) => void;
  onDeleteNode: (id: string) => void;
  onShowJson: () => void;
  isVisible: boolean;
}

function DraggablePaletteItem({
  type,
  icon: Icon,
  label,
  data,
}: {
  type: LayoutNodeType;
  icon: any;
  label: string;
  data?: any;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}-${label}`,
    data: { type, isNew: true, ...data },
  });

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "p-4 bg-muted/30 border-border items-center justify-center cursor-grab active:cursor-grabbing hover:border-sky-500/50 transition-colors",
        isDragging && "opacity-50 border-sky-500",
      )}
    >
      <Icon size={20} className="text-muted-foreground mb-2" />
      <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest text-center">
        {label}
      </Text>
    </Card>
  );
}

function ElementTreeItem({
  node,
  depth = 0,
  selectedNodeId,
  onSelect,
  onEdit,
  onDelete,
}: {
  node: LayoutNode;
  depth?: number;
  selectedNodeId?: string;
  onSelect: (node: LayoutNode) => void;
  onEdit: (node: LayoutNode, tab: string) => void;
  onDelete: (id: string) => void;
}) {
  const isSelected = selectedNodeId === (node as any)._internalId;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <View className="flex flex-col">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node);
        }}
        className={cn(
          "flex flex-row items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer transition-all group",
          isSelected
            ? "bg-sky-500/20 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.3)]"
            : "hover:bg-accent/50",
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <div className="flex-shrink-0">
          {node.type === "container" ? (
            <Grid3X3
              size={12}
              className={isSelected ? "text-sky-500" : "text-muted-foreground"}
            />
          ) : node.type === "fixed" ? (
            <Maximize
              size={12}
              className={isSelected ? "text-sky-500" : "text-muted-foreground"}
            />
          ) : (
            <Square
              size={12}
              className={isSelected ? "text-sky-500" : "text-muted-foreground"}
            />
          )}
        </div>

        <Text
          className={cn(
            "text-[10px] font-bold uppercase tracking-tight flex-1 truncate",
            isSelected ? "text-sky-500" : "text-foreground/80",
          )}
        >
          {node.name ||
            (node.type === "container"
              ? node.styles.display === "grid"
                ? "Grid"
                : "Flex"
              : node.type)}
        </Text>

        <div className="flex flex-row items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node, "style");
            }}
            className="p-1 hover:bg-sky-500/20 rounded text-muted-foreground hover:text-sky-500 transition-colors"
          >
            <Pencil size={10} />
          </button>
          {depth > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete((node as any)._internalId);
              }}
              className="p-1 hover:bg-red-500/20 rounded text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      </div>

      {hasChildren && (
        <div className="flex flex-col">
          {node.children?.map((child) => (
            <ElementTreeItem
              key={(child as any)._internalId}
              node={child}
              depth={depth + 1}
              selectedNodeId={selectedNodeId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </View>
  );
}

export const Sidebar: React.FC<SidebarProps> = ({
  layout,
  selectedNodeId,
  onCancel,
  onSelectNode,
  onEditNode,
  onDeleteNode,
  onShowJson,
  isVisible,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: -320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -320, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="w-80 border-r border-border bg-card flex flex-col h-full z-50"
        >
          <View className="p-6 border-b border-border flex-row items-center gap-4 h-20">
            <Button
              onClick={onCancel}
              variant="ghost"
              className="w-10 h-10 rounded-xl bg-background border border-border items-center justify-center p-0 hover:bg-muted"
            >
              <ChevronLeft size={20} className="text-muted-foreground" />
            </Button>
            <View>
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest mb-1 leading-none">
                {layout.type} Designer
              </Text>
              <Text className="text-foreground font-black uppercase tracking-tight truncate w-40">
                {layout.name}
              </Text>
            </View>
          </View>

          <View className="flex-1 overflow-y-auto">
            <View className="p-6 gap-8">
              {/* Elements Palette */}
              <View className="gap-4">
                <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                  Layout Design
                </Text>
                <div className="grid grid-cols-2 gap-2">
                  <DraggablePaletteItem
                    type="container"
                    icon={Grid3X3}
                    label="Grid"
                    data={{ isGrid: true }}
                  />
                  <DraggablePaletteItem
                    type="slot"
                    icon={Square}
                    label="Slot"
                  />
                  <DraggablePaletteItem
                    type="fixed"
                    icon={Maximize}
                    label="Floating"
                  />
                  <DraggablePaletteItem
                    type="fixed"
                    icon={Layers}
                    label="Overlay"
                  />
                </div>
              </View>

              {/* Element Tree */}
              <View className="border-t border-border pt-8 gap-4">
                <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                  Hierarchy
                </Text>
                <View className="bg-muted/20 rounded-2xl border border-border/50 p-2">
                  <ElementTreeItem
                    node={layout.structure as LayoutNode}
                    selectedNodeId={selectedNodeId}
                    onSelect={onSelectNode}
                    onEdit={onEditNode}
                    onDelete={onDeleteNode}
                  />
                </View>
              </View>

              {/* Advanced Section */}
              <View className="border-t border-border pt-8 gap-4">
                <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                  Canvas styles
                </Text>
                <Button
                  variant="outline"
                  onClick={onShowJson}
                  className="h-12 w-full gap-3 justify-start px-4 border-border hover:bg-sky-500/10 hover:border-sky-500/50 group"
                >
                  <Code
                    size={16}
                    className="text-muted-foreground group-hover:text-sky-500"
                  />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Edit Layout CSS
                  </span>
                </Button>
              </View>
            </View>
          </View>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
