"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { 
  View, 
  Text, 
  Button, 
  Card, 
  Input, 
  cn,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollView,
} from "@sous/ui";
import { TemplateStage } from "./shared/TemplateStage";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer";
import { LayoutNode, LayoutTemplate, LayoutNodeType } from "../types/presentation.types";
import { 
  DndContext, 
  DragOverlay, 
  useDraggable, 
  useDroppable,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";

// Custom collision detection to handle nested droppables
// It prefers droppables with smaller surface areas when multiple overlap (favoring children over parents)
const nestedCollisionDetection: CollisionDetection = (args) => {
  const pointerCollisions = pointerWithin(args);
  
  if (pointerCollisions.length > 0) {
    return pointerCollisions.sort((a: any, b: any) => {
      const aRect = a.data?.droppableContainer.rect.current;
      const bRect = b.data?.droppableContainer.rect.current;
      if (aRect && bRect) {
        const aArea = aRect.width * aRect.height;
        const bArea = bRect.width * bRect.height;
        return aArea - bArea;
      }
      return 0;
    });
  }
  
  return rectIntersection(args);
};

import { 
  ChevronLeft, 
  Save, 
  Grid3X3, 
  Square, 
  Layers, 
  Maximize,
  Settings,
  Code,
  Trash2,
  MoreVertical,
  X,
  Pencil,
  Plus
} from "lucide-react";

export interface LayoutDesignerProps {
  template?: LayoutTemplate;
  onSave: (template: LayoutTemplate) => void;
  onCancel: () => void;
}

// Internal ID tracker
let idCounter = 0;
function nextId() {
  return `node-${Date.now()}-${idCounter++}`;
}

// Recursive helper to ensure every node has an internal ID for editing
function ensureInternalIds(node: LayoutNode): LayoutNode {
  const newNode = { ...node };
  if (!(newNode as any)._internalId) {
    (newNode as any)._internalId = nextId();
  }
  if (newNode.children) {
    newNode.children = newNode.children.map(ensureInternalIds);
  }
  return newNode;
}

// Recursive helper to update a node in the tree
function updateNodeById(root: LayoutNode, internalId: string, updates: Partial<LayoutNode>): LayoutNode {
  if ((root as any)._internalId === internalId) {
    return { ...root, ...updates };
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map(child => updateNodeById(child, internalId, updates))
    };
  }
  return root;
}

// Recursive helper to delete a node
function deleteNodeById(root: LayoutNode, internalId: string): LayoutNode | null {
  if ((root as any)._internalId === internalId) {
    return null;
  }
  if (root.children) {
    const newChildren = root.children
      .map(child => deleteNodeById(child, internalId))
      .filter((c): c is LayoutNode => c !== null);
    
    return {
      ...root,
      children: newChildren
    };
  }
  return root;
}

// Recursive helper to find a node
function findNode(root: LayoutNode, id: string): LayoutNode | null {
  if ((root as any)._internalId === id || root.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNode(child, id);
      if (found) return found;
    }
  }
  return null;
}

const DEFAULT_ROOT: LayoutNode = {
  type: "container",
  name: "Root",
  styles: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    width: "100%",
  },
  children: []
};

// --- DND Components ---

function DraggablePaletteItem({ type, icon: Icon, label }: { type: LayoutNodeType; icon: any; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, isNew: true }
  });

  return (
    <Card 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "p-4 bg-black/40 border-zinc-800 items-center justify-center cursor-grab active:cursor-grabbing hover:border-sky-500/50 transition-colors",
        isDragging && "opacity-50 border-sky-500"
      )}
    >
      <Icon size={20} className="text-zinc-600 mb-2" />
      <Text className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest text-center">{label}</Text>
    </Card>
  );
}

function DroppableNodeWrapper({ node, children, onNodeClick, isSelected }: any) {
  const { setNodeRef, isOver } = useDroppable({
    id: (node as any)._internalId,
    // Allow dropping into containers OR slots (which will then convert to containers or just hold children)
    disabled: node.type === 'fixed' 
  });

  const isFixed = node.type === 'fixed';

  return (
    <div 
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node);
      }}
      className={cn(
        "relative flex flex-col transition-all min-h-[20px]",
        !isFixed && "flex-1 w-full h-full",
        isOver && !isFixed && "bg-sky-500/10 ring-2 ring-sky-500 z-30",
        isSelected && "ring-2 ring-sky-500 z-20"
      )}
    >
      {children}
    </div>
  );
}

function ResizableWrapper({ node, children, onResize }: any) {
  const [resizeType, setResizing] = useState<'w' | 'h' | 'both' | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent, type: 'w' | 'h' | 'both') => {
    e.stopPropagation();
    e.preventDefault();
    setResizing(type);
    startPos.current = { x: e.clientX, y: e.clientY };
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      startSize.current = { w: rect.width, h: rect.height };
    }
  };

  useEffect(() => {
    if (!resizeType) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPos.current.x;
      const dy = e.clientY - startPos.current.y;
      
      const parentRect = containerRef.current?.parentElement?.getBoundingClientRect();
      if (parentRect) {
        const updates: any = {};
        
        if (resizeType === 'w' || resizeType === 'both') {
          const newW = ((startSize.current.w + dx) / parentRect.width) * 100;
          updates.width = `${Math.max(2, newW).toFixed(1)}%`;
        }
        
        if (resizeType === 'h' || resizeType === 'both') {
          const newH = ((startSize.current.h + dy) / parentRect.height) * 100;
          updates.height = `${Math.max(2, newH).toFixed(1)}%`;
        }
        
        onResize(updates);
      }
    };

    const handleMouseUp = () => setResizing(null);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizeType, onResize]);

  return (
    <div ref={containerRef} className="relative w-full h-full group/resizable">
      {children}
      
      {/* Right Handle (Width) */}
      <div 
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        className="absolute top-0 right-0 w-1.5 h-full cursor-ew-resize z-[60] hover:bg-sky-500/20 transition-colors"
      />
      
      {/* Bottom Handle (Height) */}
      <div 
        onMouseDown={(e) => handleMouseDown(e, 'h')}
        className="absolute bottom-0 left-0 w-full h-1.5 cursor-ns-resize z-[60] hover:bg-sky-500/20 transition-colors"
      />

      {/* Corner Handle */}
      <div 
        onMouseDown={(e) => handleMouseDown(e, 'both')}
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-[70] flex items-center justify-center group/corner"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-zinc-600 group-hover/corner:border-sky-500 transition-colors" />
      </div>
    </div>
  );
}

// Custom Renderer that supports Droppables
function DesignerRenderer({ node, onNodeClick, onEditClick, onResize, selectedNodeId, isRoot }: any) {
  const isSelected = selectedNodeId === (node as any)._internalId;
  const isFixed = node.type === 'fixed';

  // Fixed elements in the layout are themselves draggable to move them
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `move-${(node as any)._internalId}`,
    data: { node, isMove: true },
    disabled: !isFixed
  });
  
  const content = (
    <TemplateSkeletonRenderer 
      node={node} 
      isEditMode
      selectedNodeId={selectedNodeId}
      onEditClick={onEditClick}
      isRoot={isRoot}
      renderChildren={(children: LayoutNode[]) => (
        children.map((child) => (
          <DesignerRenderer 
            key={(child as any)._internalId} 
            node={child} 
            onNodeClick={onNodeClick} 
            onEditClick={onEditClick}
            onResize={onResize}
            selectedNodeId={selectedNodeId}
            isRoot={false}
          />
        ))
      )}
    />
  );

  return (
    <div 
      ref={isFixed ? setNodeRef : undefined} 
      {...(isFixed ? listeners : {})} 
      {...(isFixed ? attributes : {})}
      className={cn(
        isFixed && "absolute z-50",
        !isFixed && "flex-1 w-full h-full",
        isDragging && "opacity-50"
      )}
      style={isFixed ? {
        left: node.styles.left,
        top: node.styles.top,
        width: node.styles.width,
        height: node.styles.height,
      } : {}}
    >
      <DroppableNodeWrapper 
        node={node} 
        onNodeClick={onNodeClick}
        isSelected={isSelected}
      >
        {!isRoot ? (
          <ResizableWrapper 
            node={node} 
            onResize={(size: any) => onResize((node as any)._internalId, size)}
          >
            {content}
          </ResizableWrapper>
        ) : content}
      </DroppableNodeWrapper>
    </div>
  );
}

export function LayoutDesigner({
  template,
  onSave,
  onCancel,
}: LayoutDesignerProps) {
  const [activeTemplate, setActiveTemplate] = useState<LayoutTemplate>(() => {
    const base = template || {
      id: "new-layout",
      name: "Untitled Layout",
      tags: [],
      root: DEFAULT_ROOT,
    };
    return {
      ...base,
      root: ensureInternalIds(base.root)
    };
  });

  const [selectedNode, setSelectedNode] = useState<LayoutNode | null>(null);
  const [editingNode, setEditingNode] = useState<LayoutNode | null>(null);
  const [showJson, setShowJson] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activeDragType, setActiveDragType] = useState<LayoutNodeType | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleUpdateNode = useCallback((internalId: string, updates: Partial<LayoutNode>) => {
    setActiveTemplate(prev => ({
      ...prev,
      root: updateNodeById(prev.root, internalId, updates)
    }));
    
    // Update selected node if it's the one being modified
    if (selectedNode && (selectedNode as any)._internalId === internalId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }

    // Update editing node if it's the one being modified
    if (editingNode && (editingNode as any)._internalId === internalId) {
      setEditingNode(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedNode, editingNode]);

  const handleDeleteNode = (internalId: string) => {
    if (internalId === (activeTemplate.root as any)._internalId) {
      // Cannot delete root
      return;
    }
    const newRoot = deleteNodeById(activeTemplate.root, internalId);
    if (newRoot) {
      setActiveTemplate(prev => ({ ...prev, root: newRoot }));
      setSelectedNode(null);
      setEditingNode(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);

    // Case 1: Moving an existing fixed element
    if (active.data.current?.isMove) {
      const node = active.data.current.node;
      const delta = event.delta;
      
      // Calculate new position in percentages
      // We assume parent is the stage for fixed elements dropped in root
      const stageRect = document.querySelector('.template-stage')?.getBoundingClientRect();
      if (stageRect) {
        const currentLeft = parseFloat(String(node.styles.left || '0')) || 0;
        const currentTop = parseFloat(String(node.styles.top || '0')) || 0;
        
        const dxPercent = (delta.x / stageRect.width) * 100;
        const dyPercent = (delta.y / stageRect.height) * 100;
        
        handleUpdateNode((node as any)._internalId, {
          styles: {
            ...node.styles,
            left: `${(currentLeft + dxPercent).toFixed(1)}%`,
            top: `${(currentTop + dyPercent).toFixed(1)}%`,
          }
        });
      }
      return;
    }

    // Case 2: Dropping a new element from palette
    if (over && active.data.current?.isNew) {
      const type = active.data.current.type as LayoutNodeType;
      const targetId = over.id as string;

      const newNode: LayoutNode = {
        type,
        name: `New ${type}`,
        styles: type === 'fixed' 
          ? { position: 'absolute', width: '20%', height: '20%', left: '40%', top: '40%', background: '#18181b' }
          : { display: 'flex', flex: 1, flexDirection: 'column' },
        children: type === "container" ? [] : undefined,
        id: type === "slot" ? `slot-${Date.now()}` : undefined,
      };

      const targetNode = findNode(activeTemplate.root, targetId);
      if (targetNode) {
        const currentChildren = targetNode.children || [];
        const nodeWithId = ensureInternalIds(newNode);
        const updates: any = {
          children: [...currentChildren, nodeWithId]
        };

        if (targetNode.type === 'slot') {
          updates.name = targetNode.name || 'Group';
        }

        handleUpdateNode(targetId, updates);
        
        if (type === 'container') {
          setEditingNode(nodeWithId);
        }
      }
    }
  };

  const handleSave = () => {
    const stripInternal = (node: LayoutNode): LayoutNode => {
      const { _internalId, ...rest } = node as any;
      if (rest.children) {
        rest.children = rest.children.map(stripInternal);
      }
      return rest;
    };

    onSave({
      ...activeTemplate,
      root: stripInternal(activeTemplate.root)
    });
  };

  const renderPropertyEditor = (node: LayoutNode) => {
    const internalId = (node as any)._internalId;
    
    // Grid rows/cols helpers
    const getGridCount = (template?: string) => {
      if (!template) return 1;
      return String(template).split(" ").length;
    };

    const setGridCount = (type: 'rows' | 'cols', count: string) => {
      const n = parseInt(count) || 1;
      const template = Array(n).fill("1fr").join(" ");
      
      const currentStyles = { ...node.styles };
      
      const updates: any = { 
        styles: { 
          ...currentStyles, 
          display: 'grid',
          flex: undefined,
          flexDirection: undefined
        } 
      };
      
      if (type === 'cols') {
        updates.styles.gridTemplateColumns = template;
        updates.styles.gridTemplateRows = currentStyles.gridTemplateRows || "1fr";
      } else {
        updates.styles.gridTemplateRows = template;
        updates.styles.gridTemplateColumns = currentStyles.gridTemplateColumns || "1fr";
      }
      
      handleUpdateNode(internalId, updates);
    };

    const generateSlots = () => {
      const cols = getGridCount(node.styles.gridTemplateColumns as string);
      const rows = getGridCount(node.styles.gridTemplateRows as string);
      const total = cols * rows;
      
      const newSlots: LayoutNode[] = Array.from({ length: total }).map((_, i) => ({
        type: 'slot',
        id: `slot-${Date.now()}-${i}`,
        name: `Slot ${i + 1}`,
        styles: { flex: 1 }
      }));

      handleUpdateNode(internalId, {
        children: newSlots.map(ensureInternalIds)
      });
    };

    return (
      <View className="gap-6 py-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
            Type: {node.type === 'container' ? (node.styles.display === 'grid' ? 'grid' : 'flex') : node.type}
          </Text>
          {node !== activeTemplate.root && (
            <button 
              onClick={() => handleDeleteNode(internalId)}
              className="px-3 py-1 bg-red-500/10 hover:bg-red-500/20 rounded-lg flex flex-row items-center gap-2 transition-colors border border-red-500/20"
            >
              <Trash2 size={12} className="text-red-500" />
              <span className="text-[8px] font-black uppercase tracking-widest text-red-500">Delete</span>
            </button>
          )}
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Name</Text>
            <Input 
              value={node.name || ""}
              onChange={(e) => handleUpdateNode(internalId, { name: e.target.value })}
              className="h-10 bg-black/40 border-zinc-800 text-xs" 
            />
          </View>

          {node.type === "slot" && (
            <View className="gap-2">
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Slot ID</Text>
              <Input 
                value={node.id || ""}
                onChange={(e) => handleUpdateNode(internalId, { id: e.target.value })}
                className="h-10 bg-black/40 border-zinc-800 text-xs font-mono" 
              />
            </View>
          )}

          {node.type === "container" && (
            <View className="gap-4">
              <View className="grid grid-cols-2 gap-4">
                <View className="gap-2">
                  <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Columns</Text>
                  <Input 
                    type="number"
                    min="1"
                    value={getGridCount(node.styles.gridTemplateColumns as string)}
                    onChange={(e) => setGridCount('cols', e.target.value)}
                    className="h-10 bg-black/40 border-zinc-800 text-xs" 
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Rows</Text>
                  <Input 
                    type="number"
                    min="1"
                    value={getGridCount(node.styles.gridTemplateRows as string)}
                    onChange={(e) => setGridCount('rows', e.target.value)}
                    className="h-10 bg-black/40 border-zinc-800 text-xs" 
                  />
                </View>
              </View>
              
              <Button onClick={generateSlots} className="bg-sky-500/10 border border-sky-500/20 h-10 gap-2">
                <Plus size={14} className="text-sky-500" />
                <span className="text-sky-500 font-black uppercase tracking-widest text-[8px]">Auto-Fill with Slots</span>
              </Button>
            </View>
          )}

          <View className="grid grid-cols-2 gap-4">
            <View className="gap-2">
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Width (%)</Text>
              <Input 
                value={String(node.styles.width || "")}
                onChange={(e) => handleUpdateNode(internalId, { styles: { ...node.styles, width: e.target.value } })}
                className="h-10 bg-black/40 border-zinc-800 text-xs" 
              />
            </View>
            <View className="gap-2">
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Height (%)</Text>
              <Input 
                value={String(node.styles.height || "")}
                onChange={(e) => handleUpdateNode(internalId, { styles: { ...node.styles, height: e.target.value } })}
                className="h-10 bg-black/40 border-zinc-800 text-xs" 
              />
            </View>
          </View>

          <View className="grid grid-cols-2 gap-4">
            <View className="gap-2">
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Gap</Text>
              <Input 
                value={String(node.styles.gap || "")}
                onChange={(e) => handleUpdateNode(internalId, { 
                  styles: { ...node.styles, gap: e.target.value } 
                })}
                className="h-10 bg-black/40 border-zinc-800 text-xs" 
              />
            </View>
            <View className="gap-2">
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Padding</Text>
              <Input 
                value={String(node.styles.padding || "")}
                onChange={(e) => handleUpdateNode(internalId, { 
                  styles: { ...node.styles, padding: e.target.value } 
                })}
                className="h-10 bg-black/40 border-zinc-800 text-xs" 
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Background</Text>
            <Input 
              value={String(node.styles.backgroundColor || node.styles.background || "")}
              onChange={(e) => handleUpdateNode(internalId, { 
                styles: { ...node.styles, background: e.target.value } 
              })}
              className="h-10 bg-black/40 border-zinc-800 text-xs" 
              placeholder="#000000 or url(...)"
            />
          </View>
        </View>
      </View>
    );
  };

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={nestedCollisionDetection}
      onDragStart={(e) => setActiveDragType(e.active.data.current?.type)}
      onDragEnd={handleDragEnd}
    >
      <View className="flex-1 h-screen bg-[#050505] flex-row overflow-hidden">
        {/* Sidebar / Toolbar */}
        <View className="w-80 border-r border-zinc-800 bg-zinc-900 flex flex-col">
          <View className="p-6 border-b border-zinc-800 flex-row items-center gap-4">
            <Button 
              onClick={onCancel}
              variant="ghost" 
              className="w-10 h-10 rounded-xl bg-black border border-zinc-800 items-center justify-center p-0"
            >
              <ChevronLeft size={20} className="text-zinc-500" />
            </Button>
            <View>
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest mb-1">
                Layout Designer
              </Text>
              <Text className="text-white font-black uppercase tracking-tight truncate w-40">
                {activeTemplate.name}
              </Text>
            </View>
          </View>

          <View className="flex-1 overflow-y-auto">
            <View className="p-6 gap-8">
              {/* Elements Palette */}
              <View className="gap-4">
                <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">
                  Elements (Drag into Canvas)
                </Text>
                <div className="grid grid-cols-2 gap-2">
                  <DraggablePaletteItem type="container" icon={Grid3X3} label="Grid (Row/Col)" />
                  <DraggablePaletteItem type="slot" icon={Square} label="Content Slot" />
                  <DraggablePaletteItem type="fixed" icon={Maximize} label="Fixed Box" />
                  <DraggablePaletteItem type="fixed" icon={Layers} label="Overlay" />
                </div>
              </View>

              {/* Selection Info */}
              <View className="border-t border-zinc-800 pt-8 gap-4">
                <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">
                  Active Selection
                </Text>
                {selectedNode ? (
                  <Card className="p-4 bg-black/40 border-zinc-800 flex-row items-center justify-between">
                    <View>
                      <Text className="text-white font-black uppercase text-[10px] tracking-tight mb-1">
                        {selectedNode.name}
                      </Text>
                      <Text className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest">
                        {selectedNode.type === 'container' ? (selectedNode.styles.display === 'grid' ? 'grid' : 'flex') : selectedNode.type}
                      </Text>
                    </View>
                    <Button 
                      onClick={() => setEditingNode(selectedNode)}
                      variant="ghost" 
                      className="w-8 h-8 p-0 bg-zinc-800 hover:bg-sky-500 transition-colors"
                    >
                      <Pencil size={12} className="text-white" />
                    </Button>
                  </Card>
                ) : (
                  <Text className="text-zinc-600 text-[8px] uppercase font-black italic">Select an element to view info</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Main Canvas */}
        <View className="flex-1 relative" onClick={() => setSelectedNode(null)}>
          <TemplateStage isEditMode className="template-stage">
            <DesignerRenderer 
              node={activeTemplate.root} 
              onNodeClick={(node: any) => setSelectedNode(node)}
              onEditClick={(node: any) => setEditingNode(node)}
              onResize={(id: string, size: any) => {
                const node = findNode(activeTemplate.root, id);
                if (node) {
                  const updates: any = { styles: { ...node.styles, ...size } };
                  // If we set specific width/height, we should probably disable flex-1 effectively
                  if (size.width || size.height) {
                    updates.styles.flex = 'none';
                  }
                  handleUpdateNode(id, updates);
                }
              }}
              selectedNodeId={selectedNode ? (selectedNode as any)._internalId : undefined}
              isRoot={true}
            />
          </TemplateStage>

          {/* Floating Action Button & Menu */}
          <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 z-[100]">
            {showMenu && (
              <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSettings(true);
                    setShowMenu(false);
                  }}
                  className="bg-zinc-900 border border-zinc-800 h-12 px-6 hover:bg-zinc-800 shadow-2xl"
                >
                  <div className="flex flex-row items-center gap-3">
                    <Settings size={16} className="text-zinc-400" />
                    <span className="text-white font-black uppercase tracking-widest text-[10px]">
                      Settings
                    </span>
                  </div>
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowJson(!showJson);
                    setShowMenu(false);
                  }}
                  className="bg-zinc-900 border border-zinc-800 h-12 px-6 hover:bg-zinc-800 shadow-2xl"
                >
                  <div className="flex flex-row items-center gap-3">
                    <Code size={16} className="text-sky-500" />
                    <span className="text-white font-black uppercase tracking-widest text-[10px]">
                      {showJson ? "Hide JSON" : "View JSON"}
                    </span>
                  </div>
                </Button>
                <Button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSave();
                    setShowMenu(false);
                  }}
                  className="bg-white h-12 px-6 hover:bg-zinc-200 shadow-2xl"
                >
                  <div className="flex flex-row items-center gap-3">
                    <Save size={16} className="text-black" />
                    <span className="text-black font-black uppercase tracking-widest text-[10px]">
                      Save Template
                    </span>
                  </div>
                </Button>
              </div>
            )}
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className={cn(
                "w-16 h-16 rounded-full shadow-2xl items-center justify-center p-0 transition-all duration-300",
                showMenu ? "bg-zinc-800 rotate-90" : "bg-sky-500 hover:bg-sky-400"
              )}
            >
              {showMenu ? <X size={24} className="text-white" /> : <MoreVertical size={24} className="text-white" />}
            </Button>
          </div>

          {/* JSON Editor Modal */}
          {showJson && (
            <View className="absolute inset-0 bg-black/90 z-[110] p-12">
              <View className="w-full h-full max-w-4xl mx-auto bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                <View className="p-6 border-b border-zinc-800 flex-row justify-between items-center">
                  <Text className="text-white font-black uppercase tracking-widest text-xs">Template Definition (JSON)</Text>
                  <Button onClick={() => setShowJson(false)} variant="ghost" className="text-zinc-500 hover:text-white">Close</Button>
                </View>
                <View className="flex-1 p-6">
                  <textarea 
                    readOnly
                    className="w-full h-full bg-black/40 border border-zinc-800 rounded-xl p-6 font-mono text-xs text-sky-500 outline-none"
                    value={JSON.stringify(activeTemplate, null, 2)}
                  />
                </View>
              </View>
            </View>
          )}

          {/* Settings Modal */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white font-black uppercase tracking-widest text-sm">Layout Settings</DialogTitle>
              </DialogHeader>
              <View className="gap-6 py-4">
                <View className="gap-2">
                  <Text className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Layout Name</Text>
                  <Input 
                    value={activeTemplate.name}
                    onChange={(e) => setActiveTemplate(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 bg-black/40 border-zinc-800 text-sm" 
                    placeholder="Enter layout name..."
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Tags (Coming Soon)</Text>
                  <div className="flex flex-row gap-2 opacity-50">
                    <div className="px-3 py-1 bg-zinc-800 rounded-full text-[8px] text-zinc-400 font-black uppercase">Menu</div>
                    <div className="px-3 py-1 bg-zinc-800 rounded-full text-[8px] text-zinc-400 font-black uppercase">Signage</div>
                  </div>
                </View>
              </View>
              <div className="flex flex-row justify-end mt-4">
                <Button onClick={() => setShowSettings(false)} className="bg-sky-500 h-10 px-6">
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">Close</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Element Properties Modal */}
          <Dialog open={!!editingNode} onOpenChange={(open) => !open && setEditingNode(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white font-black uppercase tracking-widest text-sm">Element Properties</DialogTitle>
              </DialogHeader>
              <ScrollView className="max-h-[60vh]">
                {editingNode && renderPropertyEditor(editingNode)}
              </ScrollView>
              <div className="flex flex-row justify-end mt-4">
                <Button onClick={() => setEditingNode(null)} className="bg-sky-500 h-10 px-6">
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">Close</span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </View>

        <DragOverlay>
          {activeDragType ? (
            <div className="bg-sky-500/20 border-2 border-sky-500 p-4 rounded-xl flex flex-col items-center justify-center backdrop-blur-md">
              <Text className="text-sky-500 font-black uppercase text-[8px] tracking-widest">Dragging {activeDragType}</Text>
            </div>
          ) : null}
        </DragOverlay>
      </View>
    </DndContext>
  );
}
