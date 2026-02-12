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
import { LayoutNode, Layout, LayoutNodeType, SlotAssignment, LayoutType } from "../types/presentation.types";
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
  useDndContext,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

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

import { TagManager } from "../../core/tags/components/TagManager";
import { CodeEditor } from "../../../components/CodeEditor";
import { ImageSelector } from "./shared/ImageSelector";
import { getHttpClient } from "@sous/client-sdk";
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
  Plus,
  Database,
  Image as ImageIcon,
  Check
} from "lucide-react";

export interface LayoutDesignerProps {
  layout?: Layout;
  onSave: (layout: Partial<Layout>) => void;
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

function ElementTreeItem({ 
  node, 
  depth = 0, 
  selectedNodeId, 
  onSelect, 
  onEdit,
  onDelete
}: { 
  node: LayoutNode; 
  depth?: number; 
  selectedNodeId?: string; 
  onSelect: (node: LayoutNode) => void;
  onEdit: (node: LayoutNode) => void;
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
          isSelected ? "bg-sky-500/20 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.3)]" : "hover:bg-accent/50"
        )}
        style={{ paddingLeft: `${depth * 16 + 12}px` }}
      >
        <div className="flex-shrink-0">
          {node.type === 'container' ? (
            <Grid3X3 size={12} className={isSelected ? "text-sky-500" : "text-muted-foreground"} />
          ) : node.type === 'fixed' ? (
            <Maximize size={12} className={isSelected ? "text-sky-500" : "text-muted-foreground"} />
          ) : (
            <Square size={12} className={isSelected ? "text-sky-500" : "text-muted-foreground"} />
          )}
        </div>
        
        <Text className={cn(
          "text-[10px] font-bold uppercase tracking-tight flex-1 truncate",
          isSelected ? "text-sky-500" : "text-foreground/80"
        )}>
          {node.name || (node.type === 'container' ? (node.styles.display === 'grid' ? 'Grid' : 'Flex') : node.type)}
        </Text>

        <div className="flex flex-row items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={(e) => { e.stopPropagation(); onEdit(node); }}
            className="p-1 hover:bg-sky-500/20 rounded text-muted-foreground hover:text-sky-500 transition-colors"
          >
            <Pencil size={10} />
          </button>
          {depth > 0 && (
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete((node as any)._internalId); }}
              className="p-1 hover:bg-red-500/20 rounded text-muted-foreground hover:text-red-500 transition-colors"
            >
              <Trash2 size={10} />
            </button>
          )}
        </div>
      </div>
      
      {hasChildren && (
        <div className="flex flex-col">
          {node.children?.map(child => (
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

function DraggablePaletteItem({ type, icon: Icon, label, data }: { type: LayoutNodeType; icon: any; label: string; data?: any }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}-${label}`,
    data: { type, isNew: true, ...data }
  });

  return (
    <Card 
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "p-4 bg-muted/30 border-border items-center justify-center cursor-grab active:cursor-grabbing hover:border-sky-500/50 transition-colors",
        isDragging && "opacity-50 border-sky-500"
      )}
    >
      <Icon size={20} className="text-muted-foreground mb-2" />
      <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest text-center">{label}</Text>
    </Card>
  );
}

function DroppableNodeWrapper({ node, children, onNodeClick, isSelected }: any) {
  const { setNodeRef, isOver, over } = useDroppable({
    id: (node as any)._internalId,
    // Allow dropping into containers OR slots (which will then convert to containers or just hold children)
    disabled: node.type === 'fixed' 
  });

  const { active } = useDndContext();

  const isFixed = node.type === 'fixed';
  
  // Only highlight if this is the SPECIFIC droppable being targeted 
  // AND we are NOT moving an existing fixed element (fixed elements don't drop into flow)
  const isMovingFixed = active?.data.current?.isMove;
  const isTargeted = isOver && over?.id === (node as any)._internalId && !isMovingFixed;

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
        isTargeted && !isFixed && "bg-sky-500/10 ring-2 ring-sky-500 z-30",
        isSelected && "ring-2 ring-sky-500 z-20"
      )}
    >
      {children}
    </div>
  );
}

function ResizableWrapper({ node, parentNode, children, onResize }: any) {
  const [resizeType, setResizing] = useState<'w' | 'h' | 'both' | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Hide handles if this is the only non-fixed child of the root
  const isOnlyChildOfRoot = parentNode?.name === 'Root' && parentNode?.children?.length === 1 && node.type !== 'fixed';

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
      
      const el = containerRef.current;
      if (!el) return;

      // If we are in a grid, we want to calculate percentages relative to the Grid container, 
      // not the immediate cell wrapper.
      const gridContainer = el.closest('.layout-grid-container');
      const parentRect = gridContainer 
        ? gridContainer.getBoundingClientRect() 
        : el.parentElement?.getBoundingClientRect();

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

  if (isOnlyChildOfRoot) return <div className="w-full h-full relative">{children}</div>;

  return (
    <div ref={containerRef} className="relative w-full h-full group/resizable">
      {children}
      
      {/* Right Handle (Width) */}
      <div 
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        className="absolute top-0 -right-2 w-4 h-full cursor-ew-resize z-[60] group/h-w"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-sky-500 opacity-0 group-hover/h-w:opacity-100 transition-opacity" />
      </div>
      
      {/* Bottom Handle (Height) */}
      <div 
        onMouseDown={(e) => handleMouseDown(e, 'h')}
        className="absolute -bottom-2 left-0 w-full h-4 cursor-ns-resize z-[60] group/h-h"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-sky-500 opacity-0 group-hover/h-h:opacity-100 transition-opacity" />
      </div>

      {/* Corner Handle */}
      <div 
        onMouseDown={(e) => handleMouseDown(e, 'both')}
        className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize z-[70] flex items-center justify-center group/corner"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-zinc-600 group-hover/corner:border-sky-500 transition-colors" />
      </div>
    </div>
  );
}

// Custom Renderer that supports Droppables
function DesignerRenderer({ node, parentNode, onNodeClick, onEditClick, onResize, selectedNodeId, isRoot }: any) {
  const isSelected = selectedNodeId === (node as any)._internalId;
  const isFixed = node.type === 'fixed';

  // Fixed elements in the layout are themselves draggable to move them
  const { attributes, listeners, setNodeRef, isDragging, transform } = useDraggable({
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
      onNodeClick={onNodeClick}
      isRoot={isRoot}
      renderChildren={(children: LayoutNode[]) => (
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
        transform: CSS.Translate.toString(transform),
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
            parentNode={parentNode}
            onResize={(size: any) => onResize((node as any)._internalId, size, parentNode)}
          >
            {content}
          </ResizableWrapper>
        ) : content}
      </DroppableNodeWrapper>
    </div>
  );
}

export function LayoutDesigner({
  layout,
  onSave,
  onCancel,
}: LayoutDesignerProps) {
  const [activeLayout, setActiveLayout] = useState<Partial<Layout>>(() => {
    if (layout) {
      return {
        ...layout,
        structure: ensureInternalIds(
          typeof layout.structure === 'string' 
            ? JSON.parse(layout.structure) 
            : layout.structure || DEFAULT_ROOT
        ),
        content: typeof layout.content === 'string' ? JSON.parse(layout.content) : layout.content || {},
        config: typeof layout.config === 'string' ? JSON.parse(layout.config) : layout.config || {},
      };
    }
    return {
      id: "new",
      name: "Untitled Layout",
      type: 'TEMPLATE',
      structure: ensureInternalIds(DEFAULT_ROOT),
      content: {},
      config: {},
      isSystem: false,
    };
  });

  const [selectedNode, setSelectedNode] = useState<LayoutNode | null>(null);
  const [editingNode, setEditingNode] = useState<LayoutNode | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Only fetch data if we are editing something that has content (SCREEN, LABEL, PAGE)
      if (activeLayout.type === 'TEMPLATE') return;
      
      setIsLoadingData(true);
      try {
        const http = await getHttpClient();
        const categoriesData = await http.get<any[]>("/culinary/categories");
        setCategories(categoriesData);
      } catch (e) {} finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, [activeLayout.type]);

  const handleUpdateSlotAssignment = (slotId: string, updates: Partial<SlotAssignment>) => {
    setActiveLayout(prev => {
      const currentContent = prev.content || {};
      return {
        ...prev,
        content: {
          ...currentContent,
          [slotId]: {
            ...(currentContent[slotId] || { sourceType: 'STATIC', component: 'Custom', dataConfig: {}, componentProps: {} }),
            ...updates
          }
        }
      };
    });
  };

  const renderSlotConfig = (node: LayoutNode) => {
    if (activeLayout.type === 'TEMPLATE' || !node.id) return null;
    
    const content = activeLayout.content || {};
    const assignment = content[node.id] || { sourceType: 'STATIC', component: 'Custom', dataConfig: {}, componentProps: {} };

    return (
      <View className="gap-6 border-t border-border mt-6 pt-6">
        <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">Data Binding ({node.id})</Text>
        
        <View className="gap-2">
          <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Source Provider</Text>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'POS', icon: Database, label: 'POS' },
              { id: 'MEDIA', icon: ImageIcon, label: 'Media' },
              { id: 'STATIC', icon: Code, label: 'JSON' },
            ].map(s => (
              <Button 
                key={s.id}
                onClick={() => handleUpdateSlotAssignment(node.id!, { 
                  sourceType: s.id as any,
                  component: s.id === 'POS' ? 'MenuItemList' : s.id === 'MEDIA' ? 'Image' : 'Custom'
                })}
                variant="outline"
                className={cn(
                  "h-12 border-border gap-2 p-0",
                  assignment.sourceType === s.id && "border-sky-500 bg-sky-500/5"
                )}
              >
                <s.icon size={12} className={assignment.sourceType === s.id ? "text-sky-500" : "text-muted-foreground"} />
                <span className="text-[8px] font-black uppercase">{s.label}</span>
              </Button>
            ))}
          </div>
        </View>

        {assignment.sourceType === 'POS' && (
          <View className="gap-4">
             <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Menu Category</Text>
             <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                  <Button 
                    key={cat.id}
                    onClick={() => handleUpdateSlotAssignment(node.id!, {
                      dataConfig: { ...assignment.dataConfig, filters: { ...assignment.dataConfig.filters, categoryId: cat.id } }
                    })}
                    variant="outline"
                    className={cn(
                      "h-10 border-border justify-start px-3",
                      assignment.dataConfig.filters?.categoryId === cat.id && "border-sky-500 bg-sky-500/5"
                    )}
                  >
                    <div className={cn("w-1 h-1 rounded-full mr-2", assignment.dataConfig.filters?.categoryId === cat.id ? "bg-sky-500" : "bg-muted")} />
                    <span className="text-[8px] font-black uppercase truncate">{cat.name}</span>
                  </Button>
                ))}
             </div>
          </View>
        )}

        {assignment.sourceType === 'MEDIA' && (
          <View className="gap-4">
            <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Select Image Asset</Text>
            {assignment.dataConfig?.url ? (
              <Card className="p-2 border-border bg-muted/20 relative group overflow-hidden">
                <img src={assignment.dataConfig.url} className="w-full h-32 object-cover rounded-lg" alt="Preview" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    onClick={() => setShowImageSelector(true)}
                    className="h-10 bg-white hover:bg-white/90"
                  >
                    <span className="text-black font-black uppercase text-[10px]">Change Asset</span>
                  </Button>
                </div>
              </Card>
            ) : (
              <Button 
                onClick={() => setShowImageSelector(true)}
                variant="outline"
                className="h-24 border-border border-dashed gap-3 flex flex-col hover:border-sky-500 hover:bg-sky-500/5 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon size={18} className="text-muted-foreground" />
                </div>
                <span className="text-[10px] font-black uppercase text-muted-foreground">Select Image</span>
              </Button>
            )}
            
            <ImageSelector 
              open={showImageSelector}
              selectedId={assignment.dataConfig?.mediaId}
              onSelect={(mediaId, url) => {
                handleUpdateSlotAssignment(node.id!, {
                  dataConfig: { ...assignment.dataConfig, mediaId, url }
                });
                setShowImageSelector(false);
              }}
              onCancel={() => setShowImageSelector(false)}
            />
          </View>
        )}

        {assignment.sourceType === 'STATIC' && (
          <View className="gap-2">
            <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Static JSON Data</Text>
            <div className="h-48 border border-border rounded-xl overflow-hidden">
              <CodeEditor 
                value={typeof assignment.dataConfig === 'string' ? assignment.dataConfig : JSON.stringify(assignment.dataConfig || {}, null, 2)}
                onChange={(val) => {
                  try {
                    const parsed = JSON.parse(val);
                    handleUpdateSlotAssignment(node.id!, { dataConfig: parsed });
                  } catch (e) {
                    // Don't update state on invalid JSON to avoid losing work while typing
                  }
                }}
                language="json"
              />
            </div>
            <Text className="text-[7px] text-muted-foreground font-bold uppercase tracking-widest italic">
              Use this for manual data overrides or custom component props.
            </Text>
          </View>
        )}
      </View>
    );
  };

  const [showJson, setShowJson] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [activeDragType, setActiveDragType] = useState<LayoutNodeType | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  
  // Track last used grid config to avoid "old values" or stuck defaults
  const [lastGridConfig, setLastGridConfig] = useState({ rows: 2, cols: 2 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleUpdateNode = useCallback((internalId: string, updates: Partial<LayoutNode>) => {
    setActiveLayout(prev => ({
      ...prev,
      structure: updateNodeById(prev.structure as LayoutNode, internalId, updates)
    }));
    
    if (selectedNode && (selectedNode as any)._internalId === internalId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }

    if (editingNode && (editingNode as any)._internalId === internalId) {
      setEditingNode(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedNode, editingNode]);

  const handleDeleteNode = (internalId: string) => {
    if (internalId === (activeLayout.structure as any)._internalId) return;
    const newRoot = deleteNodeById(activeLayout.structure as LayoutNode, internalId);
    if (newRoot) {
      setActiveLayout(prev => ({ ...prev, structure: newRoot }));
      setSelectedNode(null);
      setEditingNode(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);

    if (active.data.current?.isMove) {
      const node = active.data.current.node;
      const delta = event.delta;
      
      const stageRect = document.querySelector('.template-stage')?.getBoundingClientRect();
      if (stageRect) {
        const currentLeft = parseFloat(String(node.styles.left || '0')) || 0;
        const currentTop = parseFloat(String(node.styles.top || '0')) || 0;
        const width = parseFloat(String(node.styles.width || '0')) || 0;
        const height = parseFloat(String(node.styles.height || '0')) || 0;
        
        const dxPercent = (delta.x / stageRect.width) * 100;
        const dyPercent = (delta.y / stageRect.height) * 100;
        
        const nextLeft = Math.max(0, Math.min(100 - width, currentLeft + dxPercent));
        const nextTop = Math.max(0, Math.min(100 - height, currentTop + dyPercent));

        handleUpdateNode((node as any)._internalId, {
          styles: {
            ...node.styles,
            left: `${nextLeft.toFixed(1)}%`,
            top: `${nextTop.toFixed(1)}%`,
          }
        });
      }
      return;
    }

    if (over && active.data.current?.isNew) {
      const type = active.data.current.type as LayoutNodeType;
      const isGrid = active.data.current.isGrid;
      const targetId = over.id as string;

      let newNode: LayoutNode = {
        type,
        name: isGrid ? 'Grid' : `New ${type}`,
        styles: (type === 'fixed' 
          ? { position: 'absolute', width: '20%', height: '20%', left: '40%', top: '40%', background: '#18181b', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }
          : { display: isGrid ? 'grid' : 'flex', flex: 1, flexDirection: isGrid ? undefined : 'column' }) as any,
        children: (type === "container" || type === 'fixed') ? [] : undefined,
        id: type === "slot" ? `slot-${Date.now()}` : undefined,
      };

      if (type === 'fixed') {
        const stageRect = document.querySelector('.template-stage')?.getBoundingClientRect();
        if (stageRect && event.activatorEvent instanceof MouseEvent) {
          const dropX = event.activatorEvent.clientX + event.delta.x;
          const dropY = event.activatorEvent.clientY + event.delta.y;
          
          const xPercent = ((dropX - stageRect.left) / stageRect.width) * 100;
          const yPercent = ((dropY - stageRect.top) / stageRect.height) * 100;

          newNode.styles.left = `${Math.max(0, Math.min(80, xPercent - 10)).toFixed(1)}%`;
          newNode.styles.top = `${Math.max(0, Math.min(80, yPercent - 10)).toFixed(1)}%`;
        }
      }

      if (isGrid) {
        const { rows, cols } = lastGridConfig;
        newNode.styles.gridTemplateRows = Array(rows).fill("1fr").join(" ");
        newNode.styles.gridTemplateColumns = Array(cols).fill("1fr").join(" ");
        newNode.children = Array.from({ length: rows * cols }).map((_, i) => (
          ensureInternalIds({ 
            type: 'slot', 
            id: `slot-${Date.now()}-${i}`, 
            name: `Slot ${i + 1}`, 
            styles: { flex: 1 } as any 
          } as LayoutNode)
        ));
      }

      const targetNode = findNode(activeLayout.structure as LayoutNode, targetId);
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
        
        if (type === 'container' || type === 'fixed') {
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
      ...activeLayout,
      structure: stripInternal(activeLayout.structure as LayoutNode)
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
        setLastGridConfig(prev => ({ ...prev, cols: n }));
      } else {
        updates.styles.gridTemplateRows = template;
        updates.styles.gridTemplateColumns = currentStyles.gridTemplateColumns || "1fr";
        setLastGridConfig(prev => ({ ...prev, rows: n }));
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
          {node !== activeLayout.structure && (
            <button 
              onClick={() => handleDeleteNode(internalId)}
              className="px-3 py-1 bg-destructive/10 hover:bg-destructive/20 rounded-lg flex flex-row items-center gap-2 transition-colors border border-destructive/20"
            >
              <Trash2 size={12} className="text-destructive" />
              <span className="text-[8px] font-black uppercase tracking-widest text-destructive">Delete</span>
            </button>
          )}
        </View>

        <View className="gap-4">
          <View className="gap-2">
            <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Name</Text>
            <Input 
              key={`${internalId}-name`}
              value={node.name || ""}
              onChange={(e) => handleUpdateNode(internalId, { name: e.target.value })}
              className="h-10 bg-muted/50 border-border text-xs" 
            />
          </View>

          {node.type === "slot" && (
            <View className="gap-2">
              <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Slot ID</Text>
              <Input 
                key={`${internalId}-slot-id`}
                value={node.id || ""}
                onChange={(e) => handleUpdateNode(internalId, { id: e.target.value })}
                className="h-10 bg-muted/50 border-border text-xs font-mono" 
              />
            </View>
          )}

          {node.type === "container" && (
            <View className="gap-4">
              <View className="grid grid-cols-2 gap-4">
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Columns</Text>
                  <Input 
                    key={`${internalId}-cols`}
                    type="number"
                    min="1"
                    value={getGridCount(node.styles.gridTemplateColumns as string)}
                    onChange={(e) => setGridCount('cols', e.target.value)}
                    className="h-10 bg-muted/50 border-border text-xs" 
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Rows</Text>
                  <Input 
                    key={`${internalId}-rows`}
                    type="number"
                    min="1"
                    value={getGridCount(node.styles.gridTemplateRows as string)}
                    onChange={(e) => setGridCount('rows', e.target.value)}
                    className="h-10 bg-muted/50 border-border text-xs" 
                  />
                </View>
              </View>
              
              <Button onClick={generateSlots} className="bg-sky-500/10 border border-sky-500/20 h-10 gap-2 hover:bg-sky-500/20">
                <Plus size={14} className="text-sky-500" />
                <span className="text-sky-500 font-black uppercase tracking-widest text-[8px]">Auto-Fill with Slots</span>
              </Button>
            </View>
          )}

          <View className="grid grid-cols-2 gap-4">
            <View className="gap-2">
              <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Width (%)</Text>
              <Input 
                key={`${internalId}-width`}
                value={String(node.styles.width || "")}
                onChange={(e) => handleUpdateNode(internalId, { styles: { ...node.styles, width: e.target.value } })}
                className="h-10 bg-muted/50 border-border text-xs" 
              />
            </View>
            <View className="gap-2">
              <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Height (%)</Text>
              <Input 
                key={`${internalId}-height`}
                value={String(node.styles.height || "")}
                onChange={(e) => handleUpdateNode(internalId, { styles: { ...node.styles, height: e.target.value } })}
                className="h-10 bg-muted/50 border-border text-xs" 
              />
            </View>
          </View>

          <View className="grid grid-cols-2 gap-4">
            <View className="gap-2">
              <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Gap</Text>
              <Input 
                value={String(node.styles.gap || "")}
                onChange={(e) => handleUpdateNode(internalId, { 
                  styles: { ...node.styles, gap: e.target.value } 
                })}
                className="h-10 bg-muted/50 border-border text-xs" 
              />
            </View>
            <View className="gap-2">
              <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Padding</Text>
              <Input 
                value={String(node.styles.padding || "")}
                onChange={(e) => handleUpdateNode(internalId, { 
                  styles: { ...node.styles, padding: e.target.value } 
                })}
                className="h-10 bg-muted/50 border-border text-xs" 
              />
            </View>
          </View>

          <View className="gap-2">
            <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">Background</Text>
            <Input 
              value={String(node.styles.backgroundColor || node.styles.background || "")}
              onChange={(e) => handleUpdateNode(internalId, { 
                styles: { ...node.styles, background: e.target.value } 
              })}
              className="h-10 bg-muted/50 border-border text-xs" 
              placeholder="#000000 or url(...)"
            />
          </View>

          {node.type === 'slot' && renderSlotConfig(node)}
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
      <View className="flex-1 h-screen bg-background flex-row overflow-hidden">
        {/* Sidebar / Toolbar */}
        <View className="w-80 border-r border-border bg-card flex flex-col">
          <View className="p-6 border-b border-border flex-row items-center gap-4">
            <Button 
              onClick={onCancel}
              variant="ghost" 
              className="w-10 h-10 rounded-xl bg-background border border-border items-center justify-center p-0 hover:bg-muted"
            >
              <ChevronLeft size={20} className="text-muted-foreground" />
            </Button>
            <View>
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest mb-1">
                {activeLayout.type} Designer
              </Text>
              <Text className="text-foreground font-black uppercase tracking-tight truncate w-40">
                {activeLayout.name}
              </Text>
            </View>
          </View>

          <View className="flex-1 overflow-y-auto">
            <View className="p-6 gap-8">
              {/* Elements Palette */}
              <View className="gap-4">
                <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                  Elements (Drag into Canvas)
                </Text>
                <div className="grid grid-cols-2 gap-2">
                  <DraggablePaletteItem type="container" icon={Grid3X3} label="Grid (Row/Col)" data={{ isGrid: true }} />
                  <DraggablePaletteItem type="slot" icon={Square} label="Content Slot" />
                  <DraggablePaletteItem type="fixed" icon={Maximize} label="Fixed Box" />
                  <DraggablePaletteItem type="fixed" icon={Layers} label="Overlay" />
                </div>
              </View>

              {/* Element Tree */}
              <View className="border-t border-border pt-8 gap-4">
                <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                  Element Hierarchy
                </Text>
                <View className="bg-muted/20 rounded-xl border border-border/50 p-2">
                  <ElementTreeItem 
                    node={activeLayout.structure as LayoutNode}
                    selectedNodeId={selectedNode ? (selectedNode as any)._internalId : undefined}
                    onSelect={(node) => setSelectedNode(node)}
                    onEdit={(node) => setEditingNode(node)}
                    onDelete={(id) => handleDeleteNode(id)}
                  />
                </View>
              </View>


              {/* Selection Info */}
              <View className="border-t border-border pt-8 gap-4">
                <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-widest">
                  Active Selection
                </Text>
                {selectedNode ? (
                  <Card className="p-4 bg-muted/20 border-border flex-row items-center justify-between">
                    <View className="flex-1 mr-4">
                      <Text className="text-foreground font-black uppercase text-[10px] tracking-tight mb-1 truncate">
                        {selectedNode.name || 'Unnamed Element'}
                      </Text>
                      <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                        {selectedNode.type === 'container' ? (selectedNode.styles.display === 'grid' ? 'grid' : 'flex') : selectedNode.type}
                      </Text>
                    </View>
                    <Button 
                      onClick={() => setEditingNode(selectedNode)}
                      variant="ghost" 
                      className="w-8 h-8 p-0 bg-muted hover:bg-sky-500 transition-colors"
                    >
                      <Pencil size={12} className="text-foreground group-hover:text-white" />
                    </Button>
                  </Card>
                ) : (
                  <Text className="text-muted-foreground text-[8px] uppercase font-black italic">Select an element to view info</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Main Canvas */}
        <View 
          className="flex-1 relative" 
          onClick={(e) => {
            // Only deselect if clicking directly on the canvas background
            if (e.target === e.currentTarget) {
              setSelectedNode(null);
            }
          }}
        >
          <TemplateStage isEditMode className="template-stage">
            <DesignerRenderer 
              node={activeLayout.structure as LayoutNode} 
              parentNode={null}
              onNodeClick={(node: any) => {
                setSelectedNode(node);
                // If it's a slot and we are in a Screen/Label/Page (not Template), open edit modal automatically
                if (node.type === 'slot' && activeLayout.type !== 'TEMPLATE') {
                  setEditingNode(node);
                }
              }}
              onEditClick={(node: any) => setEditingNode(node)}
              onResize={(id: string, size: any, parentNode?: LayoutNode) => {
                const node = findNode(activeLayout.structure as LayoutNode, id);
                if (node) {
                  const isParentGrid = parentNode?.styles?.display === 'grid';
                  
                  if (isParentGrid && parentNode) {
                    // Grid track resizing
                    const index = parentNode.children?.findIndex((c: any) => (c._internalId || c.id) === id);
                    if (index !== undefined && index !== -1) {
                      const colsCount = String(parentNode.styles.gridTemplateColumns || "1fr").split(/\s+/).length;
                      const colIdx = index % colsCount;
                      const rowIdx = Math.floor(index / colsCount);

                      const updates: any = { styles: { ...parentNode.styles } };

                      if (size.width) {
                        const tracks = String(parentNode.styles.gridTemplateColumns || "1fr").split(/\s+/);
                        if (tracks[colIdx]) {
                          tracks[colIdx] = size.width;
                          updates.styles.gridTemplateColumns = tracks.join(" ");
                        }
                      }

                      if (size.height) {
                        const tracks = String(parentNode.styles.gridTemplateRows || "1fr").split(/\s+/);
                        if (tracks[rowIdx]) {
                          tracks[rowIdx] = size.height;
                          updates.styles.gridTemplateRows = tracks.join(" ");
                        }
                      }

                      handleUpdateNode((parentNode as any)._internalId, updates);
                    }
                  } else {
                    // Standard flex/percentage resizing
                    const updates: any = { styles: { ...node.styles, ...size } };
                    if (size.width || size.height) {
                      updates.styles.flex = 'none';
                    }
                    handleUpdateNode(id, updates);
                  }
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
                  className="bg-card border border-border h-12 px-6 hover:bg-muted shadow-2xl"
                >
                  <div className="flex flex-row items-center gap-3">
                    <Settings size={16} className="text-muted-foreground" />
                    <span className="text-foreground font-black uppercase tracking-widest text-[10px]">
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
                  className="bg-card border border-border h-12 px-6 hover:bg-muted shadow-2xl"
                >
                  <div className="flex flex-row items-center gap-3">
                    <Code size={16} className="text-sky-500" />
                    <span className="text-foreground font-black uppercase tracking-widest text-[10px]">
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
                  className="bg-primary h-12 px-6 hover:bg-primary/90 shadow-2xl"
                >
                  <div className="flex flex-row items-center gap-3">
                    <Save size={16} className="text-primary-foreground" />
                    <span className="text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                      Save {activeLayout.type}
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
                showMenu ? "bg-card border border-border rotate-90" : "bg-sky-500 hover:bg-sky-400"
              )}
            >
              {showMenu ? <X size={24} className="text-foreground" /> : <MoreVertical size={24} className="text-white" />}
            </Button>
          </div>

          {/* JSON Editor Modal */}
          {showJson && (
            <View className="absolute inset-0 bg-background/90 z-[110] p-12">
              <View className="w-full h-full max-w-4xl mx-auto bg-card border border-border rounded-3xl overflow-hidden shadow-2xl">
                <View className="p-6 border-b border-border flex-row justify-between items-center">
                  <Text className="text-foreground font-black uppercase tracking-widest text-xs">{activeLayout.type} Definition (JSON)</Text>
                  <Button onClick={() => setShowJson(false)} variant="ghost" className="text-muted-foreground hover:text-foreground">Close</Button>
                </View>
                <View className="flex-1 p-6">
                  <CodeEditor 
                    value={JSON.stringify(activeLayout, null, 2)}
                    onChange={() => {}}
                    language="json"
                    className="flex-1"
                  />
                </View>
              </View>
            </View>
          )}

          {/* Settings Modal */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent className="max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground font-black uppercase tracking-widest text-sm">{activeLayout.type} Settings</DialogTitle>
              </DialogHeader>
              <View className="gap-6 py-4">
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Name</Text>
                  <Input 
                    value={activeLayout.name}
                    onChange={(e) => setActiveLayout(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12 bg-muted/50 border-border text-sm" 
                  />
                </View>

                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Type</Text>
                  <div className="grid grid-cols-2 gap-2">
                    {['TEMPLATE', 'SCREEN', 'LABEL', 'PAGE'].map(t => (
                      <Button
                        key={t}
                        onClick={() => setActiveLayout(prev => ({ ...prev, type: t as any }))}
                        variant="outline"
                        className={cn(
                          "h-10 border-border",
                          activeLayout.type === t && "border-primary bg-primary/5"
                        )}
                      >
                        <span className="text-[8px] font-black uppercase">{t}</span>
                      </Button>
                    ))}
                  </div>
                </View>

                {activeLayout.type === 'PAGE' && (
                  <View className="gap-2">
                    <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Web Slug</Text>
                    <Input 
                      value={activeLayout.config?.webSlug || ""}
                      onChange={(e) => setActiveLayout(prev => ({ ...prev, config: { ...prev.config, webSlug: e.target.value } }))}
                      className="h-12 bg-muted/50 border-border text-sm" 
                      placeholder="e.g. menu-display"
                    />
                  </View>
                )}

                {activeLayout.type === 'LABEL' && (
                  <View className="grid grid-cols-2 gap-4">
                    <View className="gap-2">
                      <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Width (mm)</Text>
                      <Input 
                        type="number"
                        value={activeLayout.config?.dimensions?.width || 50}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setActiveLayout(prev => ({
                            ...prev,
                            config: {
                              ...prev.config,
                              dimensions: {
                                width: val,
                                height: prev.config?.dimensions?.height || 30,
                                unit: prev.config?.dimensions?.unit || 'mm'
                              }
                            }
                          }));
                        }}
                        className="h-12 bg-muted/50 border-border text-sm" 
                      />
                    </View>
                    <View className="gap-2">
                      <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">Height (mm)</Text>
                      <Input 
                        type="number"
                        value={activeLayout.config?.dimensions?.height || 30}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setActiveLayout(prev => ({
                            ...prev,
                            config: {
                              ...prev.config,
                              dimensions: {
                                height: val,
                                width: prev.config?.dimensions?.width || 50,
                                unit: prev.config?.dimensions?.unit || 'mm'
                              }
                            }
                          }));
                        }}
                        className="h-12 bg-muted/50 border-border text-sm" 
                      />
                    </View>
                  </View>
                )}

                <View className="gap-2">
                  <TagManager entityType="layout" entityId={activeLayout.id!} />
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
            <DialogContent className="max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground font-black uppercase tracking-widest text-sm">Element Properties</DialogTitle>
              </DialogHeader>
              <ScrollView className="max-h-[60vh]" key={editingNode ? (editingNode as any)._internalId : 'none'}>
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
