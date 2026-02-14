"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Checkbox,
} from "@sous/ui";
import { TemplateStage } from "./shared/TemplateStage";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer";
import {
  LayoutNode,
  Layout,
  LayoutNodeType,
  SlotAssignment,
  LayoutType,
} from "../types/presentation.types";
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

import { MenuItemList } from "./shared/MenuItemList";
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
  Check,
  Monitor,
  Filter,
  List,
  Search,
  Layout as LayoutIcon,
  Palette,
  MonitorPlay,
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

// Recursive helpers
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

function updateNodeById(
  root: LayoutNode,
  internalId: string,
  updates: Partial<LayoutNode>,
): LayoutNode {
  if ((root as any)._internalId === internalId) {
    return { ...root, ...updates };
  }
  if (root.children) {
    return {
      ...root,
      children: root.children.map((child) =>
        updateNodeById(child, internalId, updates),
      ),
    };
  }
  return root;
}

function deleteNodeById(
  root: LayoutNode,
  internalId: string,
): LayoutNode | null {
  if ((root as any)._internalId === internalId) {
    return null;
  }
  if (root.children) {
    const newChildren = root.children
      .map((child) => deleteNodeById(child, internalId))
      .filter((c): c is LayoutNode => c !== null);

    return {
      ...root,
      children: newChildren,
    };
  }
  return root;
}

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
  children: [],
};

// --- Hover Toolbar Component ---
function SlotToolbar({
  onEditStyle,
  onEditData,
  showData = true,
}: {
  onEditStyle: () => void;
  onEditData: () => void;
  showData?: boolean;
}) {
  return (
    <div className="absolute top-2 right-2 flex flex-row gap-1 opacity-0 group-hover/slot:opacity-100 transition-opacity z-[100]">
      <Button
        size="sm"
        variant="secondary"
        onClick={(e) => {
          e.stopPropagation();
          onEditStyle();
        }}
        className="h-7 px-2 bg-background/90 hover:bg-background border border-border shadow-sm gap-1.5"
      >
        <Palette size={12} className="text-sky-500" />
        <span className="text-[9px] font-black uppercase tracking-tight">
          Style
        </span>
      </Button>
      {showData && (
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            onEditData();
          }}
          className="h-7 px-2 bg-background/90 hover:bg-background border border-border shadow-sm gap-1.5"
        >
          <Database size={12} className="text-amber-500" />
          <span className="text-[9px] font-black uppercase tracking-tight">
            Data
          </span>
        </Button>
      )}
    </div>
  );
}

// --- DND Components ---

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

function DroppableNodeWrapper({
  node,
  children,
  onNodeClick,
  isSelected,
  activeLayoutType,
  onEditStyle,
  onEditData,
}: any) {
  const { setNodeRef, isOver, over } = useDroppable({
    id: (node as any)._internalId,
    disabled: node.type === "fixed",
  });

  const { active } = useDndContext();
  const isFixed = node.type === "fixed";
  const isMovingFixed = active?.data.current?.isMove;
  const isTargeted =
    isOver && over?.id === (node as any)._internalId && !isMovingFixed;

  const hasToolbar = node.type !== "container";

  return (
    <div
      ref={setNodeRef}
      onClick={(e) => {
        e.stopPropagation();
        onNodeClick(node);
      }}
      className={cn(
        "relative flex flex-col transition-all min-h-[20px]",
        hasToolbar && "group/slot",
        !isFixed && "flex-1 w-full h-full",
        isTargeted && !isFixed && "bg-sky-500/10 ring-2 ring-sky-500 z-30",
        isSelected && "ring-2 ring-sky-500 z-20",
      )}
    >
      {/* Hover Toolbar */}
      {hasToolbar && (
        <SlotToolbar
          onEditStyle={onEditStyle}
          onEditData={onEditData}
          showData={node.type === "slot" && activeLayoutType !== "TEMPLATE"}
        />
      )}
      {children}
    </div>
  );
}

function ResizableWrapper({ node, parentNode, children, onResize }: any) {
  const [resizeType, setResizing] = useState<"w" | "h" | "both" | null>(null);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const isOnlyChildOfRoot =
    parentNode?.name === "Root" &&
    parentNode?.children?.length === 1 &&
    node.type !== "fixed";

  const handleMouseDown = (e: React.MouseEvent, type: "w" | "h" | "both") => {
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

      const gridContainer = el.closest(".layout-grid-container");
      const parentRect = gridContainer
        ? gridContainer.getBoundingClientRect()
        : el.parentElement?.getBoundingClientRect();

      if (parentRect) {
        const updates: any = {};

        if (resizeType === "w" || resizeType === "both") {
          const newW = ((startSize.current.w + dx) / parentRect.width) * 100;
          updates.width = `${Math.max(2, newW).toFixed(1)}%`;
        }

        if (resizeType === "h" || resizeType === "both") {
          const newH = ((startSize.current.h + dy) / parentRect.height) * 100;
          updates.height = `${Math.max(2, newH).toFixed(1)}%`;
        }

        onResize(updates);
      }
    };

    const handleMouseUp = () => setResizing(null);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizeType, onResize]);

  if (isOnlyChildOfRoot)
    return <div className="w-full h-full relative">{children}</div>;

  return (
    <div ref={containerRef} className="relative w-full h-full group/resizable">
      {children}

      <div
        onMouseDown={(e) => handleMouseDown(e, "w")}
        className="absolute top-0 -right-2 w-4 h-full cursor-ew-resize z-[60] group/h-w"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[2px] h-full bg-sky-500 opacity-0 group-hover/h-w:opacity-100 transition-opacity" />
      </div>

      <div
        onMouseDown={(e) => handleMouseDown(e, "h")}
        className="absolute -bottom-2 left-0 w-full h-4 cursor-ns-resize z-[60] group/h-h"
      >
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-sky-500 opacity-0 group-hover/h-h:opacity-100 transition-opacity" />
      </div>

      <div
        onMouseDown={(e) => handleMouseDown(e, "both")}
        className="absolute -bottom-2 -right-2 w-6 h-6 cursor-nwse-resize z-[70] flex items-center justify-center group/corner"
      >
        <div className="w-2 h-2 border-r-2 border-b-2 border-zinc-600 group-hover/corner:border-sky-500 transition-colors" />
      </div>
    </div>
  );
}

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
}: any) {
  const isSelected = selectedNodeId === (node as any)._internalId;
  const isFixed = node.type === "fixed";

  const { attributes, listeners, setNodeRef, isDragging, transform } =
    useDraggable({
      id: `move-${(node as any)._internalId}`,
      data: { node, isMove: true },
      disabled: !isFixed,
    });

  const content = (
    <TemplateSkeletonRenderer
      node={node}
      isEditMode
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
          />
        ))
      }
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
      >
        {!isRoot ? (
          <ResizableWrapper
            node={node}
            parentNode={parentNode}
            onResize={(size: any) =>
              onResize((node as any)._internalId, size, parentNode)
            }
          >
            {content}
          </ResizableWrapper>
        ) : (
          content
        )}
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
    const layoutType = layout?.type || "Layout";
    if (layout) {
      return {
        ...layout,
        structure: ensureInternalIds(
          typeof layout.structure === "string"
            ? JSON.parse(layout.structure)
            : layout.structure || DEFAULT_ROOT,
        ),
        content:
          typeof layout.content === "string"
            ? JSON.parse(layout.content)
            : layout.content || {},
        config:
          typeof layout.config === "string"
            ? JSON.parse(layout.config)
            : layout.config || {},
      };
    }
    return {
      id: "new",
      name: "Untitled Layout",
      type: "TEMPLATE",
      structure: ensureInternalIds(DEFAULT_ROOT),
      content: {},
      config: {
        customCss: `/* Custom CSS for this ${layoutType} */\n\n.menu-item-card {\n  /* target menu items */\n}\n\n.menu-price {\n  /* target prices */\n}\n\n.slot-id-custom-id {\n  /* target specific slots */\n}`,
      },
      isSystem: false,
    };
  });

  const [selectedNode, setSelectedNode] = useState<LayoutNode | null>(null);
  const [editingNode, setEditingNode] = useState<LayoutNode | null>(null);
  const [activePropertyTab, setActivePropertyTab] = useState("style");
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [displays, setDisplays] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const http = await getHttpClient();
        console.log(
          `[LayoutDesigner] Fetching data... (Token: ${http.token ? "YES" : "NO"})`,
        );

        // Use individual try/catch or Promise.allSettled to prevent one failure from blocking all data
        const results = await Promise.allSettled([
          http.get<any[]>("/culinary/categories"),
          http.get<any[]>("/culinary/products"),
          http.get<any[]>("/hardware"),
        ]);

        const categoriesData =
          results[0].status === "fulfilled" ? results[0].value : [];
        const productsData =
          results[1].status === "fulfilled" ? results[1].value : [];
        const displaysData =
          results[2].status === "fulfilled" ? results[2].value : [];

        if (results[0].status === "rejected")
          console.error(
            "[LayoutDesigner] Categories fetch failed:",
            results[0].reason,
          );
        if (results[1].status === "rejected")
          console.error(
            "[LayoutDesigner] Products fetch failed:",
            results[1].reason,
          );
        if (results[2].status === "rejected")
          console.error(
            "[LayoutDesigner] Hardware fetch failed:",
            results[2].reason,
          );

        setCategories(categoriesData);
        setProducts(productsData);
        setDisplays(displaysData);
      } catch (e: any) {
        console.error("[LayoutDesigner] Global fetch error:", e.message);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateSlotAssignment = (
    slotId: string,
    updates: Partial<SlotAssignment>,
  ) => {
    setActiveLayout((prev) => {
      const currentContent = prev.content || {};
      return {
        ...prev,
        content: {
          ...currentContent,
          [slotId]: {
            ...(currentContent[slotId] || {
              sourceType: "STATIC",
              component: "Custom",
              dataConfig: {},
              componentProps: {},
            }),
            ...updates,
          },
        },
      };
    });
  };

  const renderSlotConfig = (node: LayoutNode) => {
    if (!node.id) return null;

    const content = activeLayout.content || {};
    const assignment = content[node.id] || {
      sourceType: "STATIC",
      component: "Custom",
      dataConfig: {},
      componentProps: {},
    };

    // Unified Item Filter/Selection logic
    const filteredProducts = products.filter((p) => {
      const matchesSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        !assignment.dataConfig?.filters?.categoryId ||
        p.categoryId === assignment.dataConfig.filters.categoryId;
      return matchesSearch && matchesCategory;
    });

    return (
      <View className="gap-6 mt-2">
        <View className="gap-2">
          <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
            Source Provider
          </Text>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: "POS", icon: Database, label: "POS" },
              { id: "MEDIA", icon: ImageIcon, label: "Media" },
              { id: "STATIC", icon: Code, label: "JSON" },
            ].map((s) => (
              <Button
                key={s.id}
                onClick={() =>
                  handleUpdateSlotAssignment(node.id!, {
                    sourceType: s.id as any,
                    component:
                      s.id === "POS"
                        ? "MenuItemList"
                        : s.id === "MEDIA"
                          ? "Image"
                          : "Custom",
                  })
                }
                variant="outline"
                className={cn(
                  "h-12 border-border gap-2 p-0",
                  assignment.sourceType === s.id &&
                    "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/50",
                )}
              >
                <s.icon
                  size={12}
                  className={
                    assignment.sourceType === s.id
                      ? "text-sky-500"
                      : "text-muted-foreground"
                  }
                />
                <span className="text-[8px] font-black uppercase">
                  {s.label}
                </span>
              </Button>
            ))}
          </div>
        </View>

        {assignment.sourceType === "POS" && (
          <View className="gap-6">
            <View className="gap-4">
              <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
                Browse & Select Items
              </Text>

              {/* Unified Search Bar */}
              <div className="relative">
                <Search
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search menu items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-muted/20 border-border text-[10px] uppercase font-bold"
                />
              </div>

              {/* Category Quick Filters */}
              <View className="gap-2">
                <Text className="text-[7px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                  Filter by Category
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="pb-2"
                >
                  <div className="flex flex-row gap-2">
                    <Button
                      size="sm"
                      variant={
                        !assignment.dataConfig?.filters?.categoryId
                          ? "default"
                          : "outline"
                      }
                      onClick={() =>
                        handleUpdateSlotAssignment(node.id!, {
                          dataConfig: {
                            ...assignment.dataConfig,
                            filters: {
                              ...assignment.dataConfig?.filters,
                              categoryId: undefined,
                            },
                          },
                        })
                      }
                      className="h-7 px-3 rounded-full border-border"
                    >
                      <span className="text-[8px] font-black uppercase">
                        All
                      </span>
                    </Button>
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        size="sm"
                        variant={
                          assignment.dataConfig?.filters?.categoryId === cat.id
                            ? "default"
                            : "outline"
                        }
                        onClick={() =>
                          handleUpdateSlotAssignment(node.id!, {
                            dataConfig: {
                              ...assignment.dataConfig,
                              filters: {
                                ...assignment.dataConfig?.filters,
                                categoryId: cat.id,
                              },
                            },
                          })
                        }
                        className={cn(
                          "h-7 px-3 rounded-full border-border",
                          assignment.dataConfig?.filters?.categoryId ===
                            cat.id && "bg-sky-500 border-sky-500",
                        )}
                      >
                        <span className="text-[8px] font-black uppercase">
                          {cat.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </ScrollView>
              </View>

              {/* Multi-Select Item List */}
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[7px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                    Results ({filteredProducts.length})
                  </Text>
                  <Button
                    onClick={async () => {
                      try {
                        const http = await getHttpClient();
                        await http.post("/integrations/sync", {
                          provider: "square",
                        });
                        // The useEffect will handle re-fetching if we add a dependency or manually call it
                        // For now, let's just alert success
                        console.log("[LayoutDesigner] Manual sync triggered");
                      } catch (e) {
                        console.error("[LayoutDesigner] Manual sync failed");
                      }
                    }}
                    variant="ghost"
                    className="h-4 p-0 px-1"
                  >
                    <span className="text-[6px] font-black uppercase text-sky-500 underline underline-offset-2">
                      Refresh from POS
                    </span>
                  </Button>
                </View>

                <ScrollView className="max-h-64 border border-border rounded-2xl bg-muted/10">
                  {isLoadingData ? (
                    <View className="p-12 items-center justify-center">
                      <Text className="text-[8px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                        Fetching menu...
                      </Text>
                    </View>
                  ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => {
                      const isSelected = (
                        assignment.dataConfig?.filters?.itemIds || []
                      ).includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            const current =
                              assignment.dataConfig?.filters?.itemIds || [];
                            const next = isSelected
                              ? current.filter((id) => id !== p.id)
                              : [...current, p.id];
                            handleUpdateSlotAssignment(node.id!, {
                              dataConfig: {
                                ...assignment.dataConfig,
                                filters: {
                                  ...assignment.dataConfig?.filters,
                                  itemIds: next,
                                },
                              },
                            });
                          }}
                          className={cn(
                            "flex flex-row items-center justify-between p-3 hover:bg-sky-500/10 cursor-pointer transition-colors border-b border-border/30 last:border-0",
                            isSelected && "bg-sky-500/5",
                          )}
                        >
                          <View className="flex-row items-center gap-3">
                            <Checkbox checked={isSelected} />
                            <View>
                              <Text
                                className={cn(
                                  "text-[9px] font-black uppercase",
                                  isSelected
                                    ? "text-sky-500"
                                    : "text-foreground/70",
                                )}
                              >
                                {p.name}
                              </Text>
                              <Text className="text-[7px] text-muted-foreground font-bold uppercase tracking-tighter">
                                {categories.find((c) => c.id === p.categoryId)
                                  ?.name || "Uncategorized"}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-[8px] font-mono text-muted-foreground">
                            ${(p.price / 100).toFixed(2)}
                          </Text>
                        </div>
                      );
                    })
                  ) : (
                    <View className="p-8 items-center justify-center opacity-30">
                      <Filter size={24} className="mb-2" />
                      <Text className="text-[8px] font-black uppercase">
                        No items match filters
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {(assignment.dataConfig?.filters?.itemIds || []).length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() =>
                      handleUpdateSlotAssignment(node.id!, {
                        dataConfig: {
                          ...assignment.dataConfig,
                          filters: {
                            ...assignment.dataConfig?.filters,
                            itemIds: [],
                          },
                        },
                      })
                    }
                    className="h-6 self-end"
                  >
                    <span className="text-[7px] font-black uppercase text-sky-500 underline underline-offset-4">
                      Clear selection
                    </span>
                  </Button>
                )}
              </View>
            </View>

            <View className="gap-4 border-t border-border pt-6">
              <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
                Display Layout
              </Text>
              <div className="grid grid-cols-6 gap-1">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <Button
                    key={num}
                    onClick={() =>
                      handleUpdateSlotAssignment(node.id!, {
                        componentProps: {
                          ...assignment.componentProps,
                          columns: num,
                        },
                      })
                    }
                    variant="outline"
                    className={cn(
                      "h-8 border-border p-0",
                      (assignment.componentProps?.columns || 2) === num &&
                        "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase",
                        (assignment.componentProps?.columns || 2) === num
                          ? "text-sky-500"
                          : "text-muted-foreground",
                      )}
                    >
                      {num}
                    </span>
                  </Button>
                ))}
              </div>

              <div className="flex flex-row gap-4">
                <div
                  onClick={() =>
                    handleUpdateSlotAssignment(node.id!, {
                      componentProps: {
                        ...assignment.componentProps,
                        showPrice:
                          assignment.componentProps?.showPrice === false,
                      },
                    })
                  }
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <Checkbox
                    checked={assignment.componentProps?.showPrice !== false}
                  />
                  <span className="text-[8px] font-black uppercase text-muted-foreground group-hover:text-foreground">
                    Show Price
                  </span>
                </div>

                <div
                  onClick={() =>
                    handleUpdateSlotAssignment(node.id!, {
                      componentProps: {
                        ...assignment.componentProps,
                        showDescription:
                          assignment.componentProps?.showDescription === false,
                      },
                    })
                  }
                  className="flex items-center gap-2 cursor-pointer group"
                >
                  <Checkbox
                    checked={
                      assignment.componentProps?.showDescription !== false
                    }
                  />
                  <span className="text-[8px] font-black uppercase text-muted-foreground group-hover:text-foreground">
                    Show Description
                  </span>
                </div>
              </div>
            </View>
          </View>
        )}

        {assignment.sourceType === "MEDIA" && (
          <View className="gap-4">
            <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
              Select Image Asset
            </Text>
            {assignment.dataConfig?.url ? (
              <Card className="p-2 border-border bg-muted/20 relative group overflow-hidden rounded-2xl">
                <img
                  src={assignment.dataConfig.url}
                  className="w-full h-48 object-cover rounded-xl"
                  alt="Preview"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    onClick={() => setShowImageSelector(true)}
                    className="h-10 bg-white hover:bg-white/90"
                  >
                    <span className="text-black font-black uppercase text-[10px]">
                      Change Asset
                    </span>
                  </Button>
                </div>
              </Card>
            ) : (
              <Button
                onClick={() => setShowImageSelector(true)}
                variant="outline"
                className="h-32 border-border border-dashed gap-3 flex flex-col hover:border-sky-500 hover:bg-sky-500/5 transition-all rounded-2xl"
              >
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                  <ImageIcon size={18} className="text-muted-foreground" />
                </div>
                <span className="text-[10px] font-black uppercase text-muted-foreground">
                  Select Image
                </span>
              </Button>
            )}
            <ImageSelector
              open={showImageSelector}
              selectedId={assignment.dataConfig?.mediaId}
              onSelect={(mediaId, url) => {
                handleUpdateSlotAssignment(node.id!, {
                  dataConfig: { ...assignment.dataConfig, mediaId, url },
                });
                setShowImageSelector(false);
              }}
              onCancel={() => setShowImageSelector(false)}
            />
          </View>
        )}

        {assignment.sourceType === "STATIC" && (
          <View className="gap-2">
            <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
              Static JSON Data
            </Text>
            <div className="h-64 border border-border rounded-xl overflow-hidden bg-card">
              <CodeEditor
                value={
                  typeof assignment.dataConfig === "string"
                    ? assignment.dataConfig
                    : JSON.stringify(assignment.dataConfig || {}, null, 2)
                }
                onChange={(val) => {
                  try {
                    const parsed = JSON.parse(val);
                    handleUpdateSlotAssignment(node.id!, {
                      dataConfig: parsed,
                    });
                  } catch (e) {}
                }}
                language="json"
              />
            </div>
          </View>
        )}
      </View>
    );
  };

  const [showJson, setShowJson] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showImageSelector, setShowImageSelector] = useState(false);
  const [activeDragType, setActiveDragType] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [lastGridConfig, setLastGridConfig] = useState({ rows: 2, cols: 2 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const contentMap = useMemo(() => {
    const slots = activeLayout.content || {};
    return Object.entries(slots).reduce(
      (acc, [id, slot]) => {
        if (slot.sourceType === "POS") {
          const itemIds = slot.dataConfig.filters?.itemIds || [];
          const categoryId = slot.dataConfig.filters?.categoryId;

          let filtered = products.filter((p) => {
            if (itemIds.length > 0) {
              return itemIds.includes(p.id);
            }
            if (categoryId) {
              return p.categoryId === categoryId;
            }
            // If neither, show nothing by default to keep canvas clean
            return false;
          });

          // Apply manual sort if exists
          const sortOrder = slot.dataConfig.sortOrder || [];
          if (sortOrder.length > 0) {
            filtered = [...filtered].sort((a, b) => {
              const idxA = sortOrder.indexOf(a.id);
              const idxB = sortOrder.indexOf(b.id);
              if (idxA === -1 && idxB === -1) return 0;
              if (idxA === -1) return 1;
              if (idxB === -1) return -1;
              return idxA - idxB;
            });
          }

          if (filtered.length > 0) {
            acc[id] = (
              <MenuItemList
                items={filtered}
                {...(slot.componentProps || {})}
                isEditMode={activeLayout.type !== "TEMPLATE"}
                overrides={slot.dataConfig.overrides || {}}
                onUpdateOverrides={(itemId, updates) => {
                  const current = slot.dataConfig.overrides || {};
                  handleUpdateSlotAssignment(id, {
                    dataConfig: {
                      ...slot.dataConfig,
                      overrides: {
                        ...current,
                        [itemId]: { ...(current[itemId] || {}), ...updates },
                      },
                    },
                  });
                }}
                onUpdateSort={(newOrder) => {
                  handleUpdateSlotAssignment(id, {
                    dataConfig: {
                      ...slot.dataConfig,
                      sortOrder: newOrder,
                    },
                  });
                }}
              />
            );
          } else {
            // Placeholder for POS slot with no data
            acc[id] = (
              <View className="flex-1 items-center justify-center p-8 bg-sky-500/5 border border-sky-500/10 m-4 rounded-3xl">
                <Database size={24} className="text-sky-500/20 mb-2" />
                <Text className="text-[10px] text-sky-500/40 font-black uppercase tracking-widest text-center">
                  {itemIds.length > 0
                    ? "Selected items not found"
                    : categoryId
                      ? "No items in category"
                      : "Bind data in properties"}
                </Text>
              </View>
            );
          }
        } else if (slot.sourceType === "MEDIA" && slot.dataConfig.url) {
          acc[id] = (
            <img
              src={slot.dataConfig.url}
              className="w-full h-full object-cover"
              alt="Content"
            />
          );
        } else if (slot.sourceType === "STATIC") {
          acc[id] = (
            <View className="flex-1 p-4">
              <Text className="text-foreground/80 font-bold text-lg mb-2">
                {slot.dataConfig.staticData?.title ||
                  slot.dataConfig.staticData?.text ||
                  "Static Content"}
              </Text>
              {slot.dataConfig.staticData?.description && (
                <Text className="text-muted-foreground text-xs">
                  {slot.dataConfig.staticData.description}
                </Text>
              )}
            </View>
          );
        }
        return acc;
      },
      {} as Record<string, React.ReactNode>,
    );
  }, [activeLayout.content, products]);

  const handleUpdateNode = useCallback(
    (internalId: string, updates: Partial<LayoutNode>) => {
      setActiveLayout((prev) => ({
        ...prev,
        structure: updateNodeById(
          prev.structure as LayoutNode,
          internalId,
          updates,
        ),
      }));

      if (selectedNode && (selectedNode as any)._internalId === internalId) {
        setSelectedNode((prev) => (prev ? { ...prev, ...updates } : null));
      }

      if (editingNode && (editingNode as any)._internalId === internalId) {
        setEditingNode((prev) => (prev ? { ...prev, ...updates } : null));
      }
    },
    [selectedNode, editingNode],
  );

  const handleDeleteNode = (internalId: string) => {
    if (internalId === (activeLayout.structure as any)._internalId) return;
    const newRoot = deleteNodeById(
      activeLayout.structure as LayoutNode,
      internalId,
    );
    if (newRoot) {
      setActiveLayout((prev) => ({ ...prev, structure: newRoot }));
      setSelectedNode(null);
      setEditingNode(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragType(null);

    if (!over) return;

    // 1. Handle Move (Existing Node)
    if (
      active.data.current?.isMove ||
      active.id.toString().startsWith("move-")
    ) {
      const activeId =
        active.data.current?.node?._internalId ||
        active.id.toString().replace("move-", "");
      const targetId = over.id as string;

      if (activeId === targetId) return;

      const activeNode = findNode(
        activeLayout.structure as LayoutNode,
        activeId,
      );
      if (!activeNode) return;

      // Handle Reparenting
      setActiveLayout((prev) => {
        // 1. Remove from old parent
        let newStructure = deleteNodeById(
          prev.structure as LayoutNode,
          activeId,
        )!;

        // 2. Find new parent
        const targetNode = findNode(newStructure, targetId);
        if (targetNode) {
          const currentChildren = targetNode.children || [];

          // Special logic for floating elements: always stay child of Root/Flex if dropped elsewhere?
          // The request said: "When a floating element is added it should remain a child of FLEX (the main container)"
          const isFloating = activeNode.type === "fixed";
          const actualTargetNode = isFloating ? newStructure : targetNode;

          const targetChildren = actualTargetNode.children || [];
          actualTargetNode.children = [...targetChildren, activeNode];

          return { ...prev, structure: { ...newStructure } };
        }
        return prev;
      });
      return;
    }

    // 2. Handle Palette Drops (New Nodes)
    if (active.data.current?.isNew) {
      const type = active.data.current.type as LayoutNodeType;
      const isGrid = active.data.current.isGrid;
      const targetId = over.id as string;

      let newNode: LayoutNode = {
        type,
        name: isGrid ? "Grid" : `New ${type}`,
        styles: (type === "fixed"
          ? {
              position: "absolute",
              width: "20%",
              height: "20%",
              left: "40%",
              top: "40%",
              background: "#18181b",
              borderRadius: "8px",
              border: "1px solid rgba(255,255,255,0.1)",
            }
          : {
              display: isGrid ? "grid" : "flex",
              flex: 1,
              flexDirection: isGrid ? undefined : "column",
            }) as any,
        children: type === "container" || type === "fixed" ? [] : undefined,
        id: type === "slot" ? `slot-${Date.now()}` : undefined,
      };

      if (type === "fixed") {
        const stageRect = document
          .querySelector(".template-stage")
          ?.getBoundingClientRect();
        if (stageRect && event.activatorEvent instanceof MouseEvent) {
          const dropX = event.activatorEvent.clientX + (event.delta.x || 0);
          const dropY = event.activatorEvent.clientY + (event.delta.y || 0);

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
        newNode.children = Array.from({ length: rows * cols }).map((_, i) =>
          ensureInternalIds({
            type: "slot",
            id: `slot-${Date.now()}-${i}`,
            name: `Slot ${i + 1}`,
            styles: { flex: 1 } as any,
          } as LayoutNode),
        );
      }

      // Special logic: fixed elements always go to root
      const effectiveTargetId =
        newNode.type === "fixed"
          ? (activeLayout.structure as any)._internalId
          : targetId;

      const targetNode = findNode(
        activeLayout.structure as LayoutNode,
        effectiveTargetId,
      );
      if (targetNode) {
        const currentChildren = targetNode.children || [];
        const nodeWithId = ensureInternalIds(newNode);
        const updates: any = {
          children: [...currentChildren, nodeWithId],
        };

        handleUpdateNode(effectiveTargetId, updates);

        if (type === "container" || type === "fixed") {
          setEditingNode(nodeWithId);
          setActivePropertyTab("style");
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
      structure: stripInternal(activeLayout.structure as LayoutNode),
    });
  };

  const renderPropertyEditor = (node: LayoutNode) => {
    const internalId = (node as any)._internalId;

    const getGridCount = (template?: string) => {
      if (!template) return 1;
      return String(template).split(" ").length;
    };

    const setGridCount = (type: "rows" | "cols", count: string) => {
      const n = parseInt(count) || 1;
      const template = Array(n).fill("1fr").join(" ");

      const currentStyles = { ...node.styles };

      const updates: any = {
        styles: {
          ...currentStyles,
          display: "grid",
          flex: undefined,
          flexDirection: undefined,
        },
      };

      if (type === "cols") {
        updates.styles.gridTemplateColumns = template;
        updates.styles.gridTemplateRows =
          currentStyles.gridTemplateRows || "1fr";
        setLastGridConfig((prev) => ({ ...prev, cols: n }));
      } else {
        updates.styles.gridTemplateRows = template;
        updates.styles.gridTemplateColumns =
          currentStyles.gridTemplateColumns || "1fr";
        setLastGridConfig((prev) => ({ ...prev, rows: n }));
      }

      handleUpdateNode(internalId, updates);
    };

    return (
      <View className="gap-8 py-2">
        {/* Basic Header Info */}
        <View className="gap-4 p-4 bg-muted/20 rounded-2xl border border-border">
          <View className="gap-2">
            <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
              Element Name
            </Text>
            <Input
              key={`${internalId}-name`}
              value={node.name || ""}
              onChange={(e) =>
                handleUpdateNode(internalId, { name: e.target.value })
              }
              className="h-10 bg-background border-border text-xs font-black uppercase"
            />
          </View>

          {node.type === "slot" && (
            <View className="gap-2">
              <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
                Slot Identifier
              </Text>
              <Input
                key={`${internalId}-slot-id`}
                value={node.id || ""}
                onChange={(e) =>
                  handleUpdateNode(internalId, { id: e.target.value })
                }
                className="h-10 bg-background border-border text-xs font-mono"
              />
            </View>
          )}
        </View>

        <Tabs
          value={activePropertyTab}
          onValueChange={setActivePropertyTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 w-full h-12 bg-muted/50 p-1.5 rounded-xl">
            <TabsTrigger
              value="style"
              className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Palette size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Styles
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="data"
              disabled={
                node.type !== "slot" || activeLayout.type === "TEMPLATE"
              }
              className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Database size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">
                Data
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="style" className="mt-6 gap-8 flex flex-col">
            {node.type === "container" && (
              <View className="gap-4">
                <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
                  Grid Controls
                </Text>
                <View className="grid grid-cols-2 gap-4">
                  <View className="gap-2">
                    <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                      Columns
                    </Text>
                    <Input
                      key={`${internalId}-cols`}
                      type="number"
                      min="1"
                      value={getGridCount(
                        node.styles.gridTemplateColumns as string,
                      )}
                      onChange={(e) => setGridCount("cols", e.target.value)}
                      className="h-10 bg-muted/20 border-border text-xs"
                    />
                  </View>
                  <View className="gap-2">
                    <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                      Rows
                    </Text>
                    <Input
                      key={`${internalId}-rows`}
                      type="number"
                      min="1"
                      value={getGridCount(
                        node.styles.gridTemplateRows as string,
                      )}
                      onChange={(e) => setGridCount("rows", e.target.value)}
                      className="h-10 bg-muted/20 border-border text-xs"
                    />
                  </View>
                </View>
              </View>
            )}

            <View className="gap-4">
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
                Dimensions
              </Text>
              <View className="grid grid-cols-2 gap-4">
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                    Width (%)
                  </Text>
                  <Input
                    key={`${internalId}-width`}
                    value={String(node.styles.width || "")}
                    onChange={(e) =>
                      handleUpdateNode(internalId, {
                        styles: { ...node.styles, width: e.target.value },
                      })
                    }
                    className="h-10 bg-muted/20 border-border text-xs"
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                    Height (%)
                  </Text>
                  <Input
                    key={`${internalId}-height`}
                    value={String(node.styles.height || "")}
                    onChange={(e) =>
                      handleUpdateNode(internalId, {
                        styles: { ...node.styles, height: e.target.value },
                      })
                    }
                    className="h-10 bg-muted/20 border-border text-xs"
                  />
                </View>
              </View>
            </View>

            <View className="gap-4">
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
                Spacing
              </Text>
              <View className="grid grid-cols-2 gap-4">
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                    Gap (px)
                  </Text>
                  <Input
                    value={String(node.styles.gap || "")}
                    onChange={(e) =>
                      handleUpdateNode(internalId, {
                        styles: { ...node.styles, gap: e.target.value },
                      })
                    }
                    className="h-10 bg-muted/20 border-border text-xs"
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                    Padding (px)
                  </Text>
                  <Input
                    value={String(node.styles.padding || "")}
                    onChange={(e) =>
                      handleUpdateNode(internalId, {
                        styles: { ...node.styles, padding: e.target.value },
                      })
                    }
                    className="h-10 bg-muted/20 border-border text-xs"
                  />
                </View>
              </View>
            </View>

            <View className="gap-2">
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
                Appearance
              </Text>
              <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest">
                Background
              </Text>
              <Input
                value={String(
                  node.styles.backgroundColor || node.styles.background || "",
                )}
                onChange={(e) =>
                  handleUpdateNode(internalId, {
                    styles: { ...node.styles, background: e.target.value },
                  })
                }
                className="h-10 bg-muted/20 border-border text-xs"
                placeholder="#000000 or url(...)"
              />
            </View>
          </TabsContent>

          <TabsContent value="data" className="mt-6">
            {node.type === "slot" && renderSlotConfig(node)}
          </TabsContent>
        </Tabs>

        {node !== activeLayout.structure && (
          <>
            <View className="border-t border-border mt-8 pt-8" />
            <Button
              onClick={() => handleDeleteNode(internalId)}
              variant="destructive"
              className="w-full h-12 gap-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 transition-all rounded-xl"
            >
              <Trash2 size={16} />
              <span className="font-black uppercase tracking-widest text-[10px]">
                Delete Element
              </span>
            </Button>
          </>
        )}
      </View>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={nestedCollisionDetection}
      onDragStart={(e) => {
        // @ts-ignore
        const type = e.active.data.current?.type as LayoutNodeType;
        if (type) setActiveDragType(type);
      }}
      onDragEnd={handleDragEnd}
    >
      <View className="flex-1 h-screen bg-background flex-row overflow-hidden">
        {/* Left Toolbar */}
        <View className="w-80 border-r border-border bg-card flex flex-col">
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
                    node={activeLayout.structure as LayoutNode}
                    selectedNodeId={
                      selectedNode
                        ? (selectedNode as any)._internalId
                        : undefined
                    }
                    onSelect={(node) => setSelectedNode(node)}
                    onEdit={(node, tab) => {
                      setSelectedNode(node);
                      setEditingNode(node);
                      setActivePropertyTab(tab);
                    }}
                    onDelete={(id) => handleDeleteNode(id)}
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
                  onClick={() => setShowJson(true)}
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
        </View>

        {/* Main Canvas */}
        <View
          className="flex-1 relative bg-[#050505]"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedNode(null);
            }
          }}
        >
          <TemplateStage
            isEditMode
            className="template-stage shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/5"
          >
            <DesignerRenderer
              node={activeLayout.structure as LayoutNode}
              parentNode={null}
              contentMap={contentMap}
              activeLayoutType={activeLayout.type}
              onNodeClick={(node: any) => setSelectedNode(node)}
              onEditClick={(node: any, tab: string) => {
                setSelectedNode(node);
                setEditingNode(node);
                setActivePropertyTab(tab);
              }}
              onResize={(id: string, size: any, parentNode?: LayoutNode) => {
                const node = findNode(activeLayout.structure as LayoutNode, id);
                if (node) {
                  const isParentGrid = parentNode?.styles?.display === "grid";
                  if (isParentGrid && parentNode) {
                    const index = parentNode.children?.findIndex(
                      (c: any) => (c._internalId || c.id) === id,
                    );
                    if (index !== undefined && index !== -1) {
                      const colsCount = String(
                        parentNode.styles.gridTemplateColumns || "1fr",
                      ).split(/\s+/).length;
                      const colIdx = index % colsCount;
                      const rowIdx = Math.floor(index / colsCount);
                      const updates: any = { styles: { ...parentNode.styles } };
                      if (size.width) {
                        const tracks = String(
                          parentNode.styles.gridTemplateColumns || "1fr",
                        ).split(/\s+/);
                        if (tracks[colIdx]) {
                          tracks[colIdx] = size.width;
                          updates.styles.gridTemplateColumns = tracks.join(" ");
                        }
                      }
                      if (size.height) {
                        const tracks = String(
                          parentNode.styles.gridTemplateRows || "1fr",
                        ).split(/\s+/);
                        if (tracks[rowIdx]) {
                          tracks[rowIdx] = size.height;
                          updates.styles.gridTemplateRows = tracks.join(" ");
                        }
                      }
                      handleUpdateNode(
                        (parentNode as any)._internalId,
                        updates,
                      );
                    }
                  } else {
                    const updates: any = {
                      styles: { ...node.styles, ...size },
                    };
                    if (size.width || size.height) updates.styles.flex = "none";
                    handleUpdateNode(id, updates);
                  }
                }
              }}
              selectedNodeId={
                selectedNode ? (selectedNode as any)._internalId : undefined
              }
              isRoot={true}
            />
          </TemplateStage>

          {/* Canvas Labels */}
          <div className="absolute top-6 right-6 flex flex-row items-center gap-4 z-[100]">
            <div className="bg-card/80 border border-border rounded-full backdrop-blur-md p-1 flex flex-row items-center relative">
              <div
                className={cn(
                  "absolute top-1 bottom-1 w-[calc(50%-4px)] bg-sky-500 rounded-full transition-all duration-300 shadow-lg shadow-sky-500/30",
                  isPreviewMode ? "left-[calc(50%+2px)]" : "left-1",
                )}
              />
              <button
                onClick={() => setIsPreviewMode(false)}
                className={cn(
                  "px-4 py-1.5 rounded-full relative z-10 transition-colors",
                  !isPreviewMode
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Text className="text-[9px] font-black uppercase tracking-widest">
                  Editor
                </Text>
              </button>
              <button
                onClick={() => setIsPreviewMode(true)}
                className={cn(
                  "px-4 py-1.5 rounded-full relative z-10 transition-colors flex flex-row items-center gap-2",
                  isPreviewMode
                    ? "text-white"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Text className="text-[9px] font-black uppercase tracking-widest">
                  Preview
                </Text>
              </button>
            </div>
          </div>

          {/* Action Menu */}
          {!isPreviewMode && (
            <div className="absolute bottom-8 right-8 flex flex-col items-end gap-4 z-[100]">
              {showMenu && (
                <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-4 duration-200">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowSettings(true);
                      setShowMenu(false);
                    }}
                    className="bg-card border border-border h-12 px-6 hover:bg-muted shadow-2xl rounded-xl"
                  >
                    <div className="flex flex-row items-center gap-3">
                      <Settings size={16} className="text-muted-foreground" />
                      <span className="text-foreground font-black uppercase tracking-widest text-[10px]">
                        Canvas Settings
                      </span>
                    </div>
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave();
                      setShowMenu(false);
                    }}
                    className="bg-primary h-12 px-6 hover:bg-primary/90 shadow-2xl rounded-xl"
                  >
                    <div className="flex flex-row items-center gap-3">
                      <Save size={16} className="text-primary-foreground" />
                      <span className="text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                        Sync Layout
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
                  "w-16 h-16 rounded-3xl shadow-2xl items-center justify-center p-0 transition-all duration-300",
                  showMenu
                    ? "bg-card border border-border rotate-90 scale-90"
                    : "bg-sky-500 hover:bg-sky-400",
                )}
              >
                {showMenu ? (
                  <X size={24} className="text-foreground" />
                ) : (
                  <MoreVertical size={24} className="text-white" />
                )}
              </Button>
            </div>
          )}

          {/* CSS/JSON Editor Sidebar */}
          <Sheet open={showJson} onOpenChange={setShowJson}>
            <SheetContent
              side="right"
              className="w-[600px] sm:max-w-[600px] bg-card border-border p-0 flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300"
            >
              <SheetHeader className="p-6 border-b border-border">
                <SheetTitle className="text-foreground font-black uppercase tracking-widest text-xs flex flex-row items-center gap-3">
                  <Code size={16} className="text-sky-500" />
                  Advanced Presentation Styles
                </SheetTitle>
              </SheetHeader>
              <Tabs defaultValue="css" className="flex-1 flex flex-col">
                <TabsList className="mx-6 mt-4 h-12 bg-muted/50 rounded-xl p-1.5">
                  <TabsTrigger value="css" className="flex-1 rounded-lg gap-2">
                    <Palette size={14} /> CSS Overrides
                  </TabsTrigger>
                  <TabsTrigger value="json" className="flex-1 rounded-lg gap-2">
                    <Code size={14} /> Structure JSON
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="css" className="flex-1 p-6">
                  <View className="flex-1 gap-4">
                    <Text className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest italic bg-sky-500/5 p-4 rounded-xl border border-sky-500/10">
                      Use standard CSS to override global presentation elements.
                      Target .menu-item-card, .menu-price, or .slot-id-[ID].
                    </Text>
                    <div className="flex-1 border border-border rounded-2xl overflow-hidden min-h-[400px]">
                      <CodeEditor
                        value={activeLayout.config?.customCss || ""}
                        onChange={(css) =>
                          setActiveLayout((prev) => ({
                            ...prev,
                            config: { ...prev.config, customCss: css },
                          }))
                        }
                        language="css"
                        className="h-full"
                      />
                    </div>
                  </View>
                </TabsContent>
                <TabsContent value="json" className="flex-1 p-6">
                  <div className="flex-1 border border-border rounded-2xl overflow-hidden h-full min-h-[400px]">
                    <CodeEditor
                      value={JSON.stringify(activeLayout, null, 2)}
                      onChange={() => {}}
                      language="json"
                      className="h-full"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </SheetContent>
          </Sheet>

          {/* Canvas Settings */}
          <Dialog open={showSettings} onOpenChange={setShowSettings}>
            <DialogContent className="max-w-md bg-card border-border rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-foreground font-black uppercase tracking-widest text-xs flex flex-row items-center gap-3">
                  <Settings size={16} className="text-sky-500" />
                  Presentation Configuration
                </DialogTitle>
              </DialogHeader>
              <ScrollView className="max-h-[70vh]">
                <View className="gap-8 py-4 px-1">
                  <View className="gap-2">
                    <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest leading-none mb-1">
                      Friendly Name
                    </Text>
                    <Input
                      value={activeLayout.name}
                      onChange={(e) =>
                        setActiveLayout((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="h-12 bg-muted/20 border-border text-sm font-bold uppercase"
                    />
                  </View>

                  <View className="gap-2">
                    <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest leading-none mb-1">
                      Entity Type
                    </Text>
                    <div className="grid grid-cols-2 gap-2">
                      {["TEMPLATE", "SCREEN", "LABEL", "PAGE"].map((t) => (
                        <Button
                          key={t}
                          onClick={() =>
                            setActiveLayout((prev) => ({
                              ...prev,
                              type: t as any,
                            }))
                          }
                          variant="outline"
                          className={cn(
                            "h-12 border-border gap-2",
                            activeLayout.type === t &&
                              "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]",
                          )}
                        >
                          <LayoutIcon
                            size={14}
                            className={
                              activeLayout.type === t
                                ? "text-sky-500"
                                : "text-muted-foreground"
                            }
                          />
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest",
                              activeLayout.type === t
                                ? "text-foreground"
                                : "text-muted-foreground",
                            )}
                          >
                            {t}
                          </span>
                        </Button>
                      ))}
                    </div>
                  </View>

                  {activeLayout.type === "SCREEN" && (
                    <View className="gap-4 border-t border-border pt-8 mt-2">
                      <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
                        Hardware Deployment
                      </Text>
                      <View className="gap-2">
                        <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest leading-none mb-1">
                          Assigned Displays
                        </Text>
                        <ScrollView className="max-h-40 border border-border rounded-2xl bg-muted/10 p-2">
                          {displays.length > 0 ? (
                            displays.map((d) => {
                              const isAssigned = (
                                activeLayout.config?.hardware || []
                              ).includes(d.id);
                              return (
                                <div
                                  key={d.id}
                                  onClick={() => {
                                    const current =
                                      activeLayout.config?.hardware || [];
                                    const next = isAssigned
                                      ? current.filter((id) => id !== d.id)
                                      : [...current, d.id];
                                    setActiveLayout((prev) => ({
                                      ...prev,
                                      config: {
                                        ...prev.config,
                                        hardware: next,
                                      },
                                    }));
                                  }}
                                  className="flex flex-row items-center gap-3 p-3 hover:bg-sky-500/10 rounded-xl cursor-pointer transition-colors"
                                >
                                  <Checkbox checked={isAssigned} />
                                  <View>
                                    <Text
                                      className={cn(
                                        "text-[10px] font-black uppercase",
                                        isAssigned
                                          ? "text-sky-500"
                                          : "text-foreground/70",
                                      )}
                                    >
                                      {d.name}
                                    </Text>
                                    <Text className="text-[8px] text-muted-foreground font-mono">
                                      {d.id.slice(0, 8)} |{" "}
                                      {d.metadata?.resolution || "Auto"}
                                    </Text>
                                  </View>
                                </div>
                              );
                            })
                          ) : (
                            <View className="p-8 items-center">
                              <MonitorPlay
                                size={24}
                                className="text-muted-foreground/30 mb-2"
                              />
                              <Text className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                                No Displays Found
                              </Text>
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    </View>
                  )}

                  <View className="gap-2 border-t border-border pt-8 mt-2">
                    <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest leading-none mb-1">
                      Classification Tags
                    </Text>
                    <TagManager
                      entityType="layout"
                      entityId={activeLayout.id!}
                    />
                  </View>
                </View>
              </ScrollView>
              <div className="flex flex-row justify-end mt-6">
                <Button
                  onClick={() => setShowSettings(false)}
                  className="bg-sky-500 h-12 px-8 rounded-2xl shadow-xl shadow-sky-500/20"
                >
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">
                    Complete Settings
                  </span>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Element Properties Sidebar */}
          <Sheet
            open={!!editingNode}
            onOpenChange={(open) => !open && setEditingNode(null)}
          >
            <SheetContent
              side="right"
              className="w-full sm:w-[450px] sm:max-w-none bg-card border-l border-border p-0 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.5)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right duration-300"
            >
              <SheetHeader className="p-6 border-b border-border h-20 flex-row items-center justify-between">
                <View className="flex-row items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                    {editingNode?.type === "slot" ? (
                      <Square size={18} className="text-sky-500" />
                    ) : (
                      <Grid3X3 size={18} className="text-sky-500" />
                    )}
                  </div>
                  <View>
                    <SheetTitle className="text-foreground font-black uppercase tracking-widest text-[10px] leading-none mb-1">
                      Properties Editor
                    </SheetTitle>
                    <Text className="text-muted-foreground text-[8px] font-black uppercase tracking-widest">
                      Editing: {editingNode?.name || editingNode?.type}
                    </Text>
                  </View>
                </View>
              </SheetHeader>

              <ScrollView
                className="flex-1 p-6"
                key={editingNode ? (editingNode as any)._internalId : "none"}
              >
                {editingNode && renderPropertyEditor(editingNode)}
              </ScrollView>

              <View className="p-6 border-t border-border bg-muted/10">
                <Button
                  onClick={() => setEditingNode(null)}
                  className="w-full h-14 bg-sky-500 hover:bg-sky-400 rounded-2xl shadow-xl shadow-sky-500/20 gap-3"
                >
                  <Check size={18} className="text-white" />
                  <span className="text-white font-black uppercase tracking-widest text-xs">
                    Apply Properties
                  </span>
                </Button>
              </View>
            </SheetContent>
          </Sheet>
        </View>

        <DragOverlay>
          {activeDragType ? (
            <div className="bg-sky-500/20 border-2 border-sky-500 p-6 rounded-3xl flex flex-col items-center justify-center backdrop-blur-md shadow-2xl animate-in zoom-in-95 duration-200">
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
                Placing {activeDragType}
              </Text>
            </div>
          ) : null}
        </DragOverlay>
      </View>
    </DndContext>
  );
}
