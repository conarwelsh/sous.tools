"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Button, Card, Input, Logo, cn, ScrollView } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { 
  ChevronLeft, 
  Save, 
  Monitor, 
  Layout, 
  Settings, 
  ExternalLink,
  Plus,
  Trash2,
  Database,
  Image as ImageIcon,
  Code,
  Check,
  X,
  ChevronRight,
  Info
} from "lucide-react";
import { ScreenConfig, LayoutTemplate, SlotAssignment } from "../types/presentation.types";
import { TemplateStage } from "./shared/TemplateStage";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer";

export interface ScreenEditorProps {
  screen: ScreenConfig;
  onSave: (screen: ScreenConfig) => void;
  onCancel: () => void;
}

export function ScreenEditor({
  screen,
  onSave,
  onCancel,
}: ScreenEditorProps) {
  const [activeScreen, setActiveScreen] = useState<ScreenConfig>(screen);
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [media, setMedia] = useState<any[]>([]);
  const [displays, setDisplays] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "targets" | "css">("content");

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const http = await getHttpClient();
        const [templatesData, categoriesData, mediaData, displaysData] = await Promise.all([
          http.get<any[]>("/presentation/templates"),
          http.get<any[]>("/culinary/categories"),
          http.get<any[]>("/media"),
          http.get<any[]>("/presentation/displays")
        ]);
        
        const mappedTemplates = templatesData.map(t => ({
          ...t,
          root: typeof t.structure === 'string' ? JSON.parse(t.structure) : t.structure
        }));
        
        setTemplates(mappedTemplates);
        setCategories(categoriesData);
        setMedia(mediaData);
        setDisplays(displaysData);

        if (activeScreen.layoutId) {
          const found = mappedTemplates.find(t => t.id === activeScreen.layoutId);
          if (found) setSelectedTemplate(found);
        }
      } catch (e) {
        console.error("Failed to fetch editor data", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [activeScreen.layoutId]);

  const handleSelectLayout = (template: LayoutTemplate) => {
    setSelectedTemplate(template);
    setActiveScreen(prev => ({
      ...prev,
      layoutId: template.id,
      slots: {} 
    }));
  };

  const handleUpdateSlot = (slotId: string, assignment: SlotAssignment) => {
    setActiveScreen(prev => ({
      ...prev,
      slots: {
        ...prev.slots,
        [slotId]: assignment
      }
    }));
    setActiveSlotId(null);
  };

  const handleSave = () => {
    onSave(activeScreen);
  };

  const toggleHardwareAssignment = (displayId: string) => {
    setActiveScreen(prev => {
      const current = prev.assignments.hardware || [];
      const next = current.includes(displayId) 
        ? current.filter(id => id !== displayId)
        : [...current, displayId];
      return {
        ...prev,
        assignments: { ...prev.assignments, hardware: next }
      };
    });
  };

  if (!selectedTemplate && !isLoading) {
    return (
      <View className="flex-1 bg-black p-12 items-center justify-center">
        <View className="max-w-4xl w-full">
          <View className="flex-row justify-between items-end mb-12">
            <View>
              <Text className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
                Select a Layout
              </Text>
              <Text className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
                Choose a structural base for your new screen.
              </Text>
            </View>
            <Button onClick={onCancel} variant="ghost" className="text-zinc-500">Cancel</Button>
          </View>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((t) => (
              <Card 
                key={t.id}
                onClick={() => handleSelectLayout(t)}
                className="p-6 bg-zinc-900 border-zinc-800 border-2 hover:border-sky-500 cursor-pointer transition-all group"
              >
                <View className="aspect-video bg-black rounded-lg border border-zinc-800 mb-4 items-center justify-center opacity-40 group-hover:opacity-100 transition-opacity">
                   <Layout size={32} className="text-zinc-700 group-hover:text-sky-500" />
                </View>
                <Text className="text-white font-black uppercase mb-1">{t.name}</Text>
                <Text className="text-zinc-500 text-[8px] uppercase font-bold tracking-widest">
                  {t.isSystem ? "Standard System Template" : "Custom Organization Template"}
                </Text>
              </Card>
            ))}
          </div>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 h-screen bg-[#050505] flex-row overflow-hidden">
      {/* Sidebar */}
      <View className="w-96 border-r border-zinc-800 bg-zinc-900 flex flex-col">
        <View className="p-6 border-b border-zinc-800 flex-row items-center gap-4">
          <Button 
            onClick={onCancel}
            variant="ghost" 
            className="w-10 h-10 rounded-xl bg-black border border-zinc-800 items-center justify-center p-0"
          >
            <ChevronLeft size={20} className="text-zinc-500" />
          </Button>
          <View className="flex-1">
            <Text className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mb-1">
              Screen Editor
            </Text>
            <Input 
              value={activeScreen.name}
              onChange={(e) => setActiveScreen(prev => ({ ...prev, name: e.target.value }))}
              className="h-8 bg-transparent border-none p-0 text-white font-black uppercase tracking-tight text-lg focus-visible:ring-0" 
            />
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="flex-row border-b border-zinc-800">
          {[
            { id: "content", label: "Content", icon: Database },
            { id: "targets", label: "Targets", icon: Monitor },
            { id: "css", label: "Custom CSS", icon: Code },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex-1 h-12 rounded-none gap-2",
                activeTab === tab.id ? "bg-white/5 border-b-2 border-emerald-500" : "text-zinc-500"
              )}
            >
              <tab.icon size={14} />
              <Text className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                activeTab === tab.id ? "text-white" : "text-zinc-500"
              )}>{tab.label}</Text>
            </Button>
          ))}
        </View>

        <ScrollView className="flex-1">
          <View className="p-6 gap-8">
            {activeTab === "content" && (
              <View className="gap-6">
                <View className="gap-2">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Selected Template</Text>
                  <Card className="p-4 bg-black/40 border-zinc-800 flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-lg bg-zinc-800 items-center justify-center">
                      <Layout size={20} className="text-zinc-500" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-xs">{selectedTemplate?.name}</Text>
                      <Text className="text-zinc-600 text-[8px] uppercase font-black">Structure Locked</Text>
                    </View>
                    <Button onClick={() => setSelectedTemplate(null)} variant="ghost" className="h-8 px-2 text-zinc-500 hover:text-white">Change</Button>
                  </Card>
                </View>

                <View className="gap-4">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Slot Assignments</Text>
                  <View className="gap-2">
                    {Object.entries(activeScreen.slots).length === 0 ? (
                      <View className="p-8 border-2 border-dashed border-zinc-800 rounded-2xl items-center justify-center">
                        <Text className="text-zinc-600 text-[10px] font-bold uppercase text-center">No slots populated.<br/>Click a slot on the canvas to assign content.</Text>
                      </View>
                    ) : (
                      Object.entries(activeScreen.slots).map(([slotId, slot]) => (
                        <Card key={slotId} className="p-4 bg-black/40 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors group" onClick={() => setActiveSlotId(slotId)}>
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-emerald-500 font-black text-[10px] uppercase tracking-tighter">{slotId}</Text>
                            <View className="flex-row gap-1">
                               <div className="bg-zinc-800 px-1.5 py-0.5 rounded text-[8px] font-black text-zinc-400 uppercase">{slot.sourceType}</div>
                            </View>
                          </View>
                          <Text className="text-white font-bold text-sm">{slot.component}</Text>
                        </Card>
                      ))
                    )}
                  </View>
                </View>
              </View>
            )}

            {activeTab === "targets" && (
              <View className="gap-6">
                <View className="gap-4">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Hardware Displays</Text>
                    <Text className="text-zinc-700 font-mono text-[10px] uppercase">{activeScreen.assignments.hardware?.length || 0} Assigned</Text>
                  </View>
                  <View className="gap-2">
                    {displays.length === 0 ? (
                      <View className="p-8 bg-black/40 border border-zinc-800 rounded-2xl items-center justify-center">
                        <Text className="text-zinc-600 text-[10px] font-bold uppercase text-center">No hardware detected.<br/>Pair a Raspberry Pi to see it here.</Text>
                      </View>
                    ) : (
                      displays.map((display) => {
                        const isAssigned = activeScreen.assignments.hardware?.includes(display.id);
                        return (
                          <Card 
                            key={display.id} 
                            onClick={() => toggleHardwareAssignment(display.id)}
                            className={cn(
                              "p-4 border-2 transition-all cursor-pointer",
                              isAssigned ? "bg-emerald-500/10 border-emerald-500" : "bg-black/40 border-zinc-800 hover:border-zinc-700"
                            )}
                          >
                            <View className="flex-row items-center gap-4">
                              <View className={cn(
                                "w-10 h-10 rounded-lg items-center justify-center",
                                isAssigned ? "bg-emerald-500/20" : "bg-zinc-800"
                              )}>
                                <Monitor size={20} className={isAssigned ? "text-emerald-500" : "text-zinc-500"} />
                              </View>
                              <View className="flex-1">
                                <Text className={cn("font-bold text-xs", isAssigned ? "text-white" : "text-zinc-400")}>{display.name}</Text>
                                <Text className="text-zinc-600 text-[8px] uppercase font-black">{display.resolution || "Auto Resolution"}</Text>
                              </View>
                              {isAssigned ? <Check size={16} className="text-emerald-500" /> : <Plus size={16} className="text-zinc-700" />}
                            </View>
                          </Card>
                        );
                      })
                    )}
                  </View>
                </View>

                <View className="gap-4 border-t border-zinc-800 pt-6">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Web / Public URL</Text>
                  <View className="gap-4">
                    <View className="gap-2">
                      <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Public Slug</Text>
                      <View className="flex-row gap-2">
                        <View className="h-10 bg-zinc-800 px-3 items-center justify-center rounded-lg border border-zinc-700">
                          <Text className="text-zinc-500 font-mono text-[10px]">sous.tools/view/</Text>
                        </View>
                        <Input 
                          value={activeScreen.assignments.webSlug || ""}
                          onChange={(e) => setActiveScreen(prev => ({ 
                            ...prev, 
                            assignments: { ...prev.assignments, webSlug: e.target.value } 
                          }))}
                          className="flex-1 h-10 bg-black/40 border-zinc-800 text-xs font-mono text-emerald-500" 
                          placeholder="bar-menu"
                        />
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2 bg-emerald-500/5 border border-emerald-500/20 p-3 rounded-xl">
                      <Info size={14} className="text-emerald-500" />
                      <Text className="text-emerald-500/80 text-[9px] font-bold uppercase leading-tight">Slug must be unique across your organization.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === "css" && (
              <View className="gap-4 h-full">
                <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Style Overrides (CSS)</Text>
                <View className="flex-1 min-h-[400px]">
                  <textarea 
                    value={activeScreen.customCss || ""}
                    onChange={(e) => setActiveScreen(prev => ({ ...prev, customCss: e.target.value }))}
                    className="w-full h-full bg-black/40 border border-zinc-800 rounded-xl p-6 font-mono text-xs text-sky-500 outline-none focus:border-sky-500/50 transition-colors"
                    placeholder=".slot-main { background: red; }"
                  />
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View className="p-6 border-t border-zinc-800 gap-2">
          <Button 
            onClick={handleSave}
            className="w-full h-12 bg-white hover:bg-zinc-200"
          >
            <View className="flex-row items-center gap-2">
              <Save size={16} className="text-black" />
              <Text className="text-black font-black uppercase tracking-widest text-[10px]">
                Publish Screen
              </Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Main Canvas */}
      <View className="flex-1 relative bg-black">
        {selectedTemplate && (
          <TemplateStage>
            <TemplateSkeletonRenderer 
              node={selectedTemplate.root} 
              isEditMode={false}
              onSlotClick={(id) => setActiveSlotId(id)}
              selectedNodeId={activeSlotId || undefined}
              contentMap={Object.entries(activeScreen.slots).reduce((acc, [id, slot]) => {
                acc[id] = (
                  <View className="flex-1 bg-emerald-500/5 items-center justify-center p-4 border border-emerald-500/20 m-1 rounded-lg">
                    <Text className="text-emerald-500 font-black uppercase text-[10px] tracking-widest">{slot.component}</Text>
                    <Text className="text-zinc-600 text-[8px] uppercase font-black mt-1">{slot.sourceType}</Text>
                  </View>
                );
                return acc;
              }, {} as any)}
            />
          </TemplateStage>
        )}

        {/* Slot Configuration Overlay */}
        {activeSlotId && (
          <View className="absolute inset-0 bg-black/90 z-50 p-12 items-center justify-center animate-in fade-in duration-200">
            <Card className="w-full max-w-4xl bg-zinc-900 border-zinc-800 p-0 rounded-3xl overflow-hidden flex flex-col max-h-full">
              <View className="p-8 border-b border-zinc-800 flex-row justify-between items-center">
                <View>
                  <Text className="text-emerald-500 font-black uppercase text-[10px] tracking-widest mb-1">Configure Slot</Text>
                  <Text className="text-white font-black uppercase text-2xl tracking-tighter">{activeSlotId}</Text>
                </View>
                <Button onClick={() => setActiveSlotId(null)} variant="ghost" className="w-10 h-10 p-0 bg-black rounded-xl border border-zinc-800 items-center justify-center">
                  <X size={20} className="text-zinc-500" />
                </Button>
              </View>

              <View className="flex-row flex-1 overflow-hidden">
                {/* Data Source Panel */}
                <View className="w-1/3 border-r border-zinc-800 p-8 gap-6">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Data Source</Text>
                  <View className="gap-2">
                    {[
                      { id: 'POS', icon: Database, label: 'POS Catalog', desc: 'Menu categories & items' },
                      { id: 'MEDIA', icon: ImageIcon, label: 'Media Library', desc: 'Images & brand assets' },
                      { id: 'STATIC', icon: Code, label: 'Static Content', desc: 'Custom text or data' },
                    ].map((source) => (
                      <Button 
                        key={source.id}
                        onClick={() => handleUpdateSlot(activeSlotId, {
                          sourceType: source.id as any,
                          dataConfig: {},
                          component: source.id === 'POS' ? 'MenuItemList' : source.id === 'MEDIA' ? 'Image' : 'Custom',
                          componentProps: {}
                        })}
                        variant="outline"
                        className={cn(
                          "h-20 justify-start px-4 gap-4 border-zinc-800 hover:border-emerald-500/50 hover:bg-emerald-500/5",
                          activeScreen.slots[activeSlotId]?.sourceType === source.id && "border-emerald-500 bg-emerald-500/10"
                        )}
                      >
                        <source.icon size={20} className={activeScreen.slots[activeSlotId]?.sourceType === source.id ? "text-emerald-500" : "text-zinc-500"} />
                        <View className="items-start">
                          <Text className="text-[10px] font-black uppercase text-white">{source.label}</Text>
                          <Text className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">{source.desc}</Text>
                        </View>
                      </Button>
                    ))}
                  </View>

                  {activeScreen.slots[activeSlotId] && (
                    <Button 
                      onClick={() => {
                        const newSlots = { ...activeScreen.slots };
                        delete newSlots[activeSlotId];
                        setActiveScreen(prev => ({ ...prev, slots: newSlots }));
                        setActiveSlotId(null);
                      }}
                      variant="ghost" 
                      className="mt-auto text-red-500 hover:bg-red-500/10 gap-2 border border-red-500/20"
                    >
                      <Trash2 size={14} />
                      <Text className="text-[10px] font-black uppercase">Clear Assignment</Text>
                    </Button>
                  )}
                </View>

                {/* Configuration Panel */}
                <View className="flex-1 bg-black/20 p-8 overflow-y-auto">
                  {!activeScreen.slots[activeSlotId] ? (
                    <View className="h-full items-center justify-center opacity-20">
                      <Database size={48} className="text-zinc-500 mb-4" />
                      <Text className="text-zinc-500 font-black uppercase text-xs">Select a data source to begin</Text>
                    </View>
                  ) : (
                    <View className="gap-8">
                      {activeScreen.slots[activeSlotId].sourceType === 'POS' && (
                        <View className="gap-6">
                          <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Configure Catalog Source</Text>
                          <View className="gap-4">
                            <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Select Category</Text>
                            <div className="grid grid-cols-2 gap-2">
                              {categories.map(cat => (
                                <Button 
                                  key={cat.id}
                                  onClick={() => handleUpdateSlot(activeSlotId, {
                                    ...activeScreen.slots[activeSlotId],
                                    dataConfig: { ...activeScreen.slots[activeSlotId].dataConfig, filters: { categoryId: cat.id } }
                                  })}
                                  variant="outline"
                                  className={cn(
                                    "h-12 border-zinc-800 justify-start px-4",
                                    activeScreen.slots[activeSlotId].dataConfig.filters?.categoryId === cat.id && "border-emerald-500 bg-emerald-500/5"
                                  )}
                                >
                                  <Text className="text-white text-[10px] font-bold uppercase">{cat.name}</Text>
                                </Button>
                              ))}
                            </div>
                          </View>

                          <View className="gap-4">
                            <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Render Component</Text>
                            <div className="flex-row gap-2">
                              {['MenuItemList', 'HeroItem', 'PriceGrid'].map(comp => (
                                <Button 
                                  key={comp}
                                  onClick={() => handleUpdateSlot(activeSlotId, {
                                    ...activeScreen.slots[activeSlotId],
                                    component: comp,
                                    componentProps: comp === 'MenuItemList' ? { columns: 2, showDescription: true } : {}
                                  })}
                                  variant="outline"
                                  className={cn(
                                    "flex-1 h-10 border-zinc-800",
                                    activeScreen.slots[activeSlotId].component === comp && "border-emerald-500 bg-emerald-500/5"
                                  )}
                                >
                                  <Text className="text-white text-[8px] font-black uppercase">{comp}</Text>
                                </Button>
                              ))}
                            </div>
                          </View>

                          {activeScreen.slots[activeSlotId].component === 'MenuItemList' && (
                            <View className="gap-4 p-4 bg-white/5 rounded-xl border border-zinc-800">
                              <Text className="text-zinc-500 font-black uppercase text-[8px] tracking-widest">Component Properties</Text>
                              <View className="flex-row gap-4">
                                <View className="flex-1 gap-2">
                                  <Text className="text-zinc-400 font-bold uppercase text-[7px]">Columns</Text>
                                  <div className="flex-row gap-1">
                                    {[1, 2, 3].map(cols => (
                                      <Button 
                                        key={cols}
                                        onClick={() => handleUpdateSlot(activeSlotId, {
                                          ...activeScreen.slots[activeSlotId],
                                          componentProps: { ...activeScreen.slots[activeSlotId].componentProps, columns: cols }
                                        })}
                                        variant="outline"
                                        className={cn(
                                          "flex-1 h-8 border-zinc-800 p-0",
                                          activeScreen.slots[activeSlotId].componentProps.columns === cols && "border-emerald-500 bg-emerald-500/10"
                                        )}
                                      >
                                        <Text className="text-white text-[10px]">{cols}</Text>
                                      </Button>
                                    ))}
                                  </div>
                                </View>
                                <View className="flex-1 gap-2">
                                  <Text className="text-zinc-400 font-bold uppercase text-[7px]">Descriptions</Text>
                                  <Button 
                                    onClick={() => handleUpdateSlot(activeSlotId, {
                                      ...activeScreen.slots[activeSlotId],
                                      componentProps: { ...activeScreen.slots[activeSlotId].componentProps, showDescription: !activeScreen.slots[activeSlotId].componentProps.showDescription }
                                    })}
                                    variant="outline"
                                    className={cn(
                                      "h-8 border-zinc-800",
                                      activeScreen.slots[activeSlotId].componentProps.showDescription && "border-emerald-500 bg-emerald-500/10"
                                    )}
                                  >
                                    <Text className="text-white text-[10px]">{activeScreen.slots[activeSlotId].componentProps.showDescription ? "Shown" : "Hidden"}</Text>
                                  </Button>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      )}

                      {activeScreen.slots[activeSlotId].sourceType === 'MEDIA' && (
                        <View className="gap-6">
                          <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Select Asset</Text>
                          <div className="grid grid-cols-3 gap-2">
                            {media.map(item => (
                              <div 
                                key={item.id}
                                onClick={() => handleUpdateSlot(activeSlotId, {
                                  ...activeScreen.slots[activeSlotId],
                                  dataConfig: { ...activeScreen.slots[activeSlotId].dataConfig, mediaId: item.id }
                                })}
                                className={cn(
                                  "aspect-square bg-black border-2 rounded-xl overflow-hidden cursor-pointer",
                                  activeScreen.slots[activeSlotId].dataConfig.mediaId === item.id ? "border-emerald-500" : "border-zinc-800 hover:border-zinc-700"
                                )}
                              >
                                <img src={item.url} className="w-full h-full object-cover opacity-60" alt={item.name} />
                              </div>
                            ))}
                          </div>
                        </View>
                      )}

                      {activeScreen.slots[activeSlotId].sourceType === 'STATIC' && (
                        <View className="gap-4">
                          <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Static Content</Text>
                          <textarea 
                            value={JSON.stringify(activeScreen.slots[activeSlotId].dataConfig.staticData || {}, null, 2)}
                            onChange={(e) => {
                              try {
                                const parsed = JSON.parse(e.target.value);
                                handleUpdateSlot(activeSlotId, {
                                  ...activeScreen.slots[activeSlotId],
                                  dataConfig: { ...activeScreen.slots[activeSlotId].dataConfig, staticData: parsed }
                                });
                              } catch (e) {}
                            }}
                            className="w-full h-64 bg-black border border-zinc-800 rounded-xl p-4 font-mono text-xs text-emerald-500 outline-none"
                            placeholder='{ "title": "Welcome" }'
                          />
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
            </Card>
          </View>
        )}
      </View>
    </View>
  );
}