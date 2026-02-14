"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Text,
  cn,
} from "@sous/ui";
import {
  DndContext,
  DragOverlay,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from "@dnd-kit/core";
import { Code, Palette, Square, Grid3X3 } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";
import { motion, AnimatePresence } from "framer-motion";

import { Sidebar } from "./components/Sidebar";
import { Canvas } from "./components/Canvas";
import { ActionMenu } from "./components/ActionMenu";
import { SettingsDialog } from "./components/SettingsDialog";
import { PropertyEditor } from "./components/PropertyEditor";
import { CodeEditor } from "../../../../components/CodeEditor";
import { MenuItemList } from "../shared/MenuItemList";

import {
  LayoutNode,
  Layout,
  LayoutNodeType,
  SlotAssignment,
} from "../../types/presentation.types";

// Helper Functions (Re-implemented from the original)
let idCounter = 0;
function nextId() {
  return `node-${Date.now()}-${idCounter++}`;
}

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

export interface LayoutDesignerProps {
  layout?: Layout;
  onSave: (layout: Partial<Layout>) => void;
  onCancel: () => void;
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
        customCss: `/* Custom CSS for this ${layoutType} */

.menu-item-card {
  /* target menu items */
}

.menu-price {
  /* target prices */
}

.slot-id-custom-id {
  /* target specific slots */
}`,
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const http = await getHttpClient();
        const results = await Promise.allSettled([
          http.get<any[]>("/culinary/categories"),
          http.get<any[]>("/culinary/products"),
          http.get<any[]>("/hardware"),
        ]);

        const categoriesData = results[0].status === "fulfilled" ? results[0].value : [];
        const productsData = results[1].status === "fulfilled" ? results[1].value : [];
        const displaysData = results[2].status === "fulfilled" ? results[2].value : [];

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

  const contentMap = useMemo(() => {
    const slots = activeLayout.content || {};
    return Object.entries(slots).reduce(
      (acc, [id, slot]) => {
        if (slot.sourceType === "POS") {
          const itemIds = slot.dataConfig.filters?.itemIds || [];
          const categoryId = slot.dataConfig.filters?.categoryId;

          let filtered = products.filter((p) => {
            if (itemIds.length > 0) return itemIds.includes(p.id);
            if (categoryId) return p.categoryId === categoryId;
            return false;
          });

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
                isEditMode={activeLayout.type !== "TEMPLATE" && !isPreviewMode}
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
            acc[id] = (
              <View className="flex-1 items-center justify-center p-8 bg-sky-500/5 border border-sky-500/10 m-4 rounded-3xl">
                <Text className="text-[10px] text-sky-500/40 font-black uppercase tracking-widest text-center">
                  Bind data in properties
                </Text>
              </View>
            );
          }
        } else if (slot.sourceType === "MEDIA" && slot.dataConfig.url) {
          acc[id] = <img src={slot.dataConfig.url} className="w-full h-full object-cover" alt="Content" />;
        } else if (slot.sourceType === "STATIC") {
          acc[id] = (
            <View className="flex-1 p-4">
              <Text className="text-foreground/80 font-bold text-lg mb-2">
                {slot.dataConfig.staticData?.title || slot.dataConfig.staticData?.text || "Static Content"}
              </Text>
            </View>
          );
        }
        return acc;
      },
      {} as Record<string, React.ReactNode>,
    );
  }, [activeLayout.content, products, isPreviewMode]);

  const handleUpdateNode = useCallback(
    (internalId: string, updates: Partial<LayoutNode>) => {
      setActiveLayout((prev) => ({
        ...prev,
        structure: updateNodeById(prev.structure as LayoutNode, internalId, updates),
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
    const newRoot = deleteNodeById(activeLayout.structure as LayoutNode, internalId);
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

    if (active.data.current?.isMove || active.id.toString().startsWith("move-")) {
      const activeId = active.data.current?.node?._internalId || active.id.toString().replace("move-", "");
      const targetId = over.id as string;
      if (activeId === targetId) return;

      const activeNode = findNode(activeLayout.structure as LayoutNode, activeId);
      if (!activeNode) return;

      setActiveLayout((prev) => {
        let newStructure = deleteNodeById(prev.structure as LayoutNode, activeId)!;
        const targetNode = findNode(newStructure, targetId);
        if (targetNode) {
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

    if (active.data.current?.isNew) {
      const type = active.data.current.type as LayoutNodeType;
      const isGrid = active.data.current.isGrid;
      const targetId = over.id as string;

      let newNode: LayoutNode = {
        type,
        name: isGrid ? "Grid" : `New ${type}`,
        styles: (type === "fixed" ? {
          position: "absolute",
          width: "20%",
          height: "20%",
          left: "40%",
          top: "40%",
          background: "#18181b",
          borderRadius: "8px",
          border: "1px solid rgba(255,255,255,0.1)",
        } : {
          display: isGrid ? "grid" : "flex",
          flex: 1,
          flexDirection: isGrid ? undefined : "column",
        }) as any,
        children: type === "container" || type === "fixed" ? [] : undefined,
        id: type === "slot" ? `slot-${Date.now()}` : undefined,
      };

      const effectiveTargetId = newNode.type === "fixed" ? (activeLayout.structure as any)._internalId : targetId;
      const targetNode = findNode(activeLayout.structure as LayoutNode, effectiveTargetId);
      if (targetNode) {
        const currentChildren = targetNode.children || [];
        const nodeWithId = ensureInternalIds(newNode);
        handleUpdateNode(effectiveTargetId, { children: [...currentChildren, nodeWithId] });
        if (type === "container" || type === "fixed") {
          setEditingNode(nodeWithId);
          setActivePropertyTab("style");
        }
      }
    }
  };

  const handleFinalSave = () => {
    const stripInternal = (node: LayoutNode): LayoutNode => {
      const { _internalId, ...rest } = node as any;
      if (rest.children) rest.children = rest.children.map(stripInternal);
      return rest;
    };

    onSave({
      ...activeLayout,
      structure: stripInternal(activeLayout.structure as LayoutNode),
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={nestedCollisionDetection}
      onDragStart={(e) => {
        const type = e.active.data.current?.type as LayoutNodeType;
        if (type) setActiveDragType(type);
      }}
      onDragEnd={handleDragEnd}
    >
      <View className="flex-1 h-screen bg-background flex-row overflow-hidden">
        <Sidebar
          isVisible={!isPreviewMode}
          layout={activeLayout}
          selectedNodeId={selectedNode ? (selectedNode as any)._internalId : undefined}
          onCancel={onCancel}
          onSelectNode={setSelectedNode}
          onEditNode={(node, tab) => {
            setSelectedNode(node);
            setEditingNode(node);
            setActivePropertyTab(tab);
          }}
          onDeleteNode={handleDeleteNode}
          onShowJson={() => setShowJson(true)}
        />

        <Canvas
          structure={activeLayout.structure as LayoutNode}
          contentMap={contentMap}
          activeLayoutType={activeLayout.type!}
          selectedNodeId={selectedNode ? (selectedNode as any)._internalId : undefined}
          isPreviewMode={isPreviewMode}
          onNodeClick={setSelectedNode}
          onEditClick={(node, tab) => {
            setSelectedNode(node);
            setEditingNode(node);
            setActivePropertyTab(tab);
          }}
          onResize={(id, size, parentNode) => {
            const node = findNode(activeLayout.structure as LayoutNode, id);
            if (node) {
              const isParentGrid = parentNode?.styles?.display === "grid";
              if (isParentGrid && parentNode) {
                const index = parentNode.children?.findIndex((c: any) => (c._internalId || c.id) === id);
                if (index !== undefined && index !== -1) {
                  const colsCount = String(parentNode.styles.gridTemplateColumns || "1fr").split(/\s+/).length;
                  const colIdx = index % colsCount;
                  const rowIdx = Math.floor(index / colsCount);
                  const updates: any = { styles: { ...parentNode.styles } };
                  if (size.width) {
                    const tracks = String(parentNode.styles.gridTemplateColumns || "1fr").split(/\s+/);
                    if (tracks[colIdx]) { tracks[colIdx] = size.width; updates.styles.gridTemplateColumns = tracks.join(" "); }
                  }
                  if (size.height) {
                    const tracks = String(parentNode.styles.gridTemplateRows || "1fr").split(/\s+/);
                    if (tracks[rowIdx]) { tracks[rowIdx] = size.height; updates.styles.gridTemplateRows = tracks.join(" "); }
                  }
                  handleUpdateNode((parentNode as any)._internalId, updates);
                }
              } else {
                const updates: any = { styles: { ...node.styles, ...size } };
                if (size.width || size.height) updates.styles.flex = "none";
                handleUpdateNode(id, updates);
              }
            }
          }}
        />

        <ActionMenu
          isPreviewMode={isPreviewMode}
          setIsPreviewMode={setIsPreviewMode}
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          setShowSettings={setShowSettings}
          onSave={handleFinalSave}
        />

        <SettingsDialog
          open={showSettings}
          onOpenChange={setShowSettings}
          layout={activeLayout}
          setLayout={setActiveLayout}
          displays={displays}
        />

        <Sheet open={showJson} onOpenChange={setShowJson}>
          <SheetContent side="right" className="w-[600px] bg-card border-border p-0 flex flex-col">
            <SheetHeader className="p-6 border-b border-border">
              <SheetTitle className="text-foreground font-black uppercase tracking-widest text-xs flex flex-row items-center gap-3">
                <Code size={16} className="text-sky-500" /> Advanced Presentation Styles
              </SheetTitle>
            </SheetHeader>
            <Tabs defaultValue="css" className="flex-1 flex flex-col">
              <TabsList className="mx-6 mt-4 h-12 bg-muted/50 rounded-xl p-1.5">
                <TabsTrigger value="css" className="flex-1 rounded-lg gap-2"><Palette size={14} /> CSS Overrides</TabsTrigger>
                <TabsTrigger value="json" className="flex-1 rounded-lg gap-2"><Code size={14} /> Structure JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="css" className="flex-1 p-6">
                <div className="flex-1 border border-border rounded-2xl overflow-hidden min-h-[400px]">
                  <CodeEditor
                    value={activeLayout.config?.customCss || ""}
                    onChange={(css) => setActiveLayout(prev => ({ ...prev, config: { ...prev.config, customCss: css } }))}
                    language="css"
                    className="h-full"
                  />
                </div>
              </TabsContent>
              <TabsContent value="json" className="flex-1 p-6">
                <div className="h-full border border-border rounded-2xl overflow-hidden">
                  <CodeEditor value={JSON.stringify(activeLayout, null, 2)} onChange={() => {}} language="json" className="h-full" />
                </div>
              </TabsContent>
            </Tabs>
          </SheetContent>
        </Sheet>

        <Sheet open={!!editingNode} onOpenChange={(open) => !open && setEditingNode(null)}>
          <SheetContent side="right" className="w-full sm:w-[450px] bg-card border-l border-border p-0 flex flex-col">
            <SheetHeader className="p-6 border-b border-border h-20 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                  {editingNode?.type === "slot" ? <Square size={18} className="text-sky-500" /> : <Grid3X3 size={18} className="text-sky-500" />}
                </div>
                <View>
                  <SheetTitle className="text-foreground font-black uppercase tracking-widest text-[10px] leading-none mb-1">Properties Editor</SheetTitle>
                  <Text className="text-muted-foreground text-[8px] font-black uppercase tracking-widest">Editing: {editingNode?.name || editingNode?.type}</Text>
                </View>
              </View>
            </SheetHeader>
            <ScrollView className="flex-1 p-6">
              {editingNode && (
                <PropertyEditor
                  node={editingNode}
                  activeLayout={activeLayout}
                  activePropertyTab={activePropertyTab}
                  setActivePropertyTab={setActivePropertyTab}
                  handleUpdateNode={handleUpdateNode}
                  handleDeleteNode={handleDeleteNode}
                  handleUpdateSlotAssignment={handleUpdateSlotAssignment}
                  products={products}
                  categories={categories}
                  isLoadingData={isLoadingData}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  showImageSelector={showImageSelector}
                  setShowImageSelector={setShowImageSelector}
                  onSyncPOS={async () => {
                    try {
                      const http = await getHttpClient();
                      await http.post("/integrations/sync", { provider: "square" });
                    } catch (e) {}
                  }}
                />
              )}
            </ScrollView>
          </SheetContent>
        </Sheet>

        <DragOverlay>
          {activeDragType ? (
            <div className="bg-sky-500/20 border-2 border-sky-500 p-6 rounded-3xl flex flex-col items-center justify-center backdrop-blur-md shadow-2xl">
              <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">Placing {activeDragType}</Text>
            </div>
          ) : null}
        </DragOverlay>
      </View>
    </DndContext>
  );
}
