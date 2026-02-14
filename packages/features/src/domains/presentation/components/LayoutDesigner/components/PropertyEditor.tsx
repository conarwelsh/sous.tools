"use client";

import React from "react";
import {
  View,
  Text,
  Button,
  Card,
  Input,
  ScrollView,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Checkbox,
} from "@sous/ui";
import {
  Grid3X3,
  Square,
  Trash2,
  Database,
  Image as ImageIcon,
  Code,
  Palette,
  Search,
  Filter,
} from "lucide-react";
import { MenuItemList } from "../../shared/MenuItemList";
import { ImageSelector } from "../../shared/ImageSelector";
import { CodeEditor } from "../../../../../components/CodeEditor";
import {
  LayoutNode,
  SlotAssignment,
  Layout,
} from "../../../types/presentation.types";
import { cn } from "@sous/ui";

interface PropertyEditorProps {
  node: LayoutNode;
  activeLayout: Partial<Layout>;
  activePropertyTab: string;
  setActivePropertyTab: (tab: string) => void;
  handleUpdateNode: (id: string, updates: Partial<LayoutNode>) => void;
  handleDeleteNode: (id: string) => void;
  handleUpdateSlotAssignment: (
    id: string,
    updates: Partial<SlotAssignment>,
  ) => void;
  products: any[];
  categories: any[];
  isLoadingData: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showImageSelector: boolean;
  setShowImageSelector: (show: boolean) => void;
  onSyncPOS: () => void;
}

export const PropertyEditor: React.FC<PropertyEditorProps> = ({
  node,
  activeLayout,
  activePropertyTab,
  setActivePropertyTab,
  handleUpdateNode,
  handleDeleteNode,
  handleUpdateSlotAssignment,
  products,
  categories,
  isLoadingData,
  searchQuery,
  setSearchQuery,
  showImageSelector,
  setShowImageSelector,
  onSyncPOS,
}) => {
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
      updates.styles.gridTemplateRows = currentStyles.gridTemplateRows || "1fr";
    } else {
      updates.styles.gridTemplateRows = template;
      updates.styles.gridTemplateColumns =
        currentStyles.gridTemplateColumns || "1fr";
    }
    handleUpdateNode(internalId, updates);
  };

  const renderSlotConfig = () => {
    if (!node.id) return null;

    const content = activeLayout.content || {};
    const assignment = content[node.id] || {
      sourceType: "STATIC",
      component: "Custom",
      dataConfig: {},
      componentProps: {},
    };

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
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-[7px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                    Results ({filteredProducts.length})
                  </Text>
                  <Button
                    onClick={onSyncPOS}
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

  return (
    <View className="gap-8 py-2">
      <View className="gap-4 p-4 bg-muted/20 rounded-2xl border border-border">
        <View className="gap-2">
          <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest">
            Element Name
          </Text>
          <Input
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
            disabled={node.type !== "slot" || activeLayout.type === "TEMPLATE"}
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
                    type="number"
                    min="1"
                    value={getGridCount(node.styles.gridTemplateRows as string)}
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
          {node.type === "slot" && renderSlotConfig()}
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
