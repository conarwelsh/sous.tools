"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  Button, 
  Card, 
  Input, 
  Logo, 
  cn, 
  ScrollView,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { 
  ChevronLeft, 
  Save, 
  Monitor, 
  Layout, 
  Database, 
  Image as ImageIcon,
  Code,
  Check,
  X,
  Info,
  Trash2,
  Plus,
  Settings,
  ChevronRight
} from "lucide-react";
import { ScreenConfig, LayoutTemplate, SlotAssignment, LayoutNode } from "../types/presentation.types";
import { TemplateStage } from "./shared/TemplateStage";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer";
import { LayoutTemplateSelector } from "./shared/LayoutTemplateSelector";
import { ImageSelector } from "./shared/ImageSelector";

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
  const [categories, setCategories] = useState<any[]>([]);
  const [displays, setDisplays] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LayoutTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"content" | "targets" | "css">("content");
  
  // Modal states
  const [showLayoutSelector, setShowLayoutSelector] = useState(!screen.layoutId);
  const [showImageSelector, setShowImageSelector] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const http = await getHttpClient();
        const [categoriesData, displaysData] = await Promise.all([
          http.get<any[]>("/culinary/categories"),
          http.get<any[]>("/presentation/displays")
        ]);
        
        setCategories(categoriesData);
        setDisplays(displaysData);

        if (activeScreen.layoutId) {
          const templatesData = await http.get<any[]>("/presentation/templates");
          const found = templatesData.find(t => t.id === activeScreen.layoutId);
          if (found) {
            setSelectedTemplate({
              ...found,
              root: typeof found.structure === 'string' ? JSON.parse(found.structure) : found.structure
            });
          }
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
      // We keep existing slots if possible, but for a clean start on new layouts we might want to reset
      // Actually, spec says "chooses a structural base", so keeping shared slots is nice
    }));
    setShowLayoutSelector(false);
  };

  const handleUpdateSlot = (slotId: string, assignment: SlotAssignment) => {
    setActiveScreen(prev => ({
      ...prev,
      slots: {
        ...prev.slots,
        [slotId]: assignment
      }
    }));
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

  const contentMap = useMemo(() => {
    return Object.entries(activeScreen.slots).reduce((acc, [id, slot]) => {
      acc[id] = (
        <View className="flex-1 bg-sky-500/5 items-center justify-center p-4 border border-sky-500/20 m-1 rounded-lg">
          <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">{slot.component}</Text>
          <Text className="text-zinc-600 text-[8px] uppercase font-black mt-1">{slot.sourceType}</Text>
        </View>
      );
      return acc;
    }, {} as Record<string, React.ReactNode>);
  }, [activeScreen.slots]);

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
            <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest mb-1">
              Screen Editor
            </Text>
            <Input 
              value={activeScreen.name}
              onChange={(e) => setActiveScreen(prev => ({ ...prev, name: e.target.value }))}
              className="h-8 bg-transparent border-none p-0 text-white font-black uppercase tracking-tight text-lg focus-visible:ring-0" 
            />
          </View>
        </View>

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
                "flex-1 h-12 rounded-none gap-2 transition-all",
                activeTab === tab.id ? "bg-white/5 border-b-2 border-sky-500" : "text-zinc-500"
              )}
            >
              <tab.icon size={14} className={activeTab === tab.id ? "text-sky-500" : ""} />
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
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Active Layout</Text>
                  <Card className="p-4 bg-black/40 border-zinc-800 flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-lg bg-zinc-800 items-center justify-center text-zinc-500">
                      <Layout size={20} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-bold text-xs">{selectedTemplate?.name || "No layout selected"}</Text>
                      <Text className="text-zinc-600 text-[8px] uppercase font-black">Skeleton Template</Text>
                    </View>
                    <Button onClick={() => setShowLayoutSelector(true)} variant="ghost" className="h-8 px-2 text-sky-500 hover:bg-sky-500/10 uppercase font-black text-[8px]">Switch</Button>
                  </Card>
                </View>

                <View className="gap-4">
                  <div className="flex flex-row justify-between items-center">
                    <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Slot Configuration</Text>
                    <Text className="text-zinc-700 font-mono text-[8px] uppercase">{Object.keys(activeScreen.slots).length} Populated</Text>
                  </div>
                  <View className="gap-2">
                    {Object.entries(activeScreen.slots).length === 0 ? (
                      <View className="p-8 border-2 border-dashed border-zinc-800 rounded-2xl items-center justify-center bg-black/20">
                        <Text className="text-zinc-600 text-[10px] font-bold uppercase text-center leading-relaxed">
                          No slots populated.<br/>Click a slot on the canvas to assign content.
                        </Text>
                      </View>
                    ) : (
                      Object.entries(activeScreen.slots).map(([slotId, slot]) => (
                        <Card 
                          key={slotId} 
                          className={cn(
                            "p-4 bg-black/40 border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors group",
                            activeSlotId === slotId && "border-sky-500 bg-sky-500/5"
                          )} 
                          onClick={() => setActiveSlotId(slotId)}
                        >
                          <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-sky-500 font-black text-[10px] uppercase tracking-tighter">{slotId}</Text>
                            <div className="bg-zinc-800 px-1.5 py-0.5 rounded text-[8px] font-black text-zinc-400 uppercase">{slot.sourceType}</div>
                          </View>
                          <div className="flex flex-row justify-between items-center">
                            <Text className="text-white font-bold text-sm">{slot.component}</Text>
                            <ChevronRight size={14} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                          </div>
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
                    <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Physical Hardware (HDMI)</Text>
                    <Text className="text-zinc-700 font-mono text-[8px] uppercase">{activeScreen.assignments.hardware?.length || 0} Assigned</Text>
                  </View>
                  <View className="gap-2">
                    {displays.length === 0 ? (
                      <View className="p-8 bg-black/40 border border-zinc-800 rounded-2xl items-center justify-center">
                        <Text className="text-zinc-600 text-[10px] font-bold uppercase text-center leading-relaxed">
                          No hardware detected.<br/>Pair a Raspberry Pi to see it here.
                        </Text>
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
                              isAssigned ? "bg-sky-500/10 border-sky-500" : "bg-black/40 border-zinc-800 hover:border-zinc-700"
                            )}
                          >
                            <View className="flex-row items-center gap-4">
                              <View className={cn(
                                "w-10 h-10 rounded-lg items-center justify-center",
                                isAssigned ? "bg-sky-500/20" : "bg-zinc-800"
                              )}>
                                <Monitor size={20} className={isAssigned ? "text-sky-500" : "text-zinc-500"} />
                              </View>
                              <View className="flex-1">
                                <Text className={cn("font-bold text-xs", isAssigned ? "text-white" : "text-zinc-400")}>{display.name}</Text>
                                <Text className="text-zinc-600 text-[8px] uppercase font-black">{display.resolution || "Auto Resolution"}</Text>
                              </View>
                              {isAssigned ? <Check size={16} className="text-sky-500" /> : <Plus size={16} className="text-zinc-700" />}
                            </View>
                          </Card>
                        );
                      })
                    )}
                  </View>
                </View>

                <View className="gap-4 border-t border-zinc-800 pt-6">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Web / Smart TV (URL)</Text>
                  <View className="gap-4">
                    <View className="gap-2">
                      <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">URL Slug</Text>
                      <View className="flex-row gap-2">
                        <View className="h-10 bg-zinc-800 px-3 items-center justify-center rounded-lg border border-zinc-700">
                          <Text className="text-zinc-500 font-mono text-[10px]">view/</Text>
                        </View>
                        <Input 
                          value={activeScreen.assignments.webSlug || ""}
                          onChange={(e) => setActiveScreen(prev => ({ 
                            ...prev, 
                            assignments: { ...prev.assignments, webSlug: e.target.value } 
                          }))}
                          className="flex-1 h-10 bg-black/40 border-zinc-800 text-xs font-mono text-sky-500" 
                          placeholder="bar-menu"
                        />
                      </View>
                    </View>
                    <View className="flex-row items-center gap-2 bg-sky-500/5 border border-sky-500/20 p-3 rounded-xl">
                      <Info size={14} className="text-sky-500" />
                      <Text className="text-sky-500/80 text-[9px] font-bold uppercase leading-tight">Slug must be unique across your organization.</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {activeTab === "css" && (
              <View className="gap-4 h-full">
                <div className="flex flex-row justify-between items-center">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Global Style Overrides</Text>
                  <div className="flex flex-row items-center gap-1.5 bg-sky-500/10 px-2 py-1 rounded-full">
                    <Code size={10} className="text-sky-500" />
                    <Text className="text-sky-500 font-black text-[8px] uppercase">CSS</Text>
                  </div>
                </div>
                <View className="flex-1 min-h-[400px]">
                  <textarea 
                    value={activeScreen.customCss || ""}
                    onChange={(e) => setActiveScreen(prev => ({ ...prev, customCss: e.target.value }))}
                    className="w-full h-full bg-black/40 border border-zinc-800 rounded-xl p-6 font-mono text-xs text-sky-500 outline-none focus:border-sky-500/50 transition-colors resize-none"
                    placeholder=".slot-main { background: rgba(0,0,0,0.5); }"
                  />
                </View>
                <Text className="text-zinc-600 text-[8px] font-bold uppercase leading-relaxed px-2">
                  Tip: Target slots by ID using .slot-ID selectors.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        <View className="p-6 border-t border-zinc-800 gap-2">
          <Button 
            onClick={() => onSave(activeScreen)}
            className="w-full h-14 bg-white hover:bg-zinc-200 shadow-xl shadow-white/5 group"
          >
            <View className="flex-row items-center gap-3">
              <Save size={18} className="text-black group-hover:scale-110 transition-transform" />
              <Text className="text-black font-black uppercase tracking-[0.1em] text-xs">
                Publish Changes
              </Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Main Canvas */}
      <View className="flex-1 relative bg-black">
        {selectedTemplate ? (
          <TemplateStage>
            <TemplateSkeletonRenderer 
              node={selectedTemplate.root} 
              isEditMode={false}
              onSlotClick={(id) => setActiveSlotId(id)}
              selectedNodeId={activeSlotId || undefined}
              contentMap={contentMap}
            />
          </TemplateStage>
        ) : (
          <View className="flex-1 items-center justify-center opacity-20">
             <Layout size={64} className="text-zinc-500 mb-4 animate-pulse" />
             <Text className="text-zinc-500 font-black uppercase tracking-widest text-xs">Awaiting Layout Selection...</Text>
          </View>
        )}

        {/* Slot Configuration Overlay */}
        {activeSlotId && (
          <View className="absolute inset-0 bg-black/90 z-50 p-12 items-center justify-center animate-in fade-in zoom-in-95 duration-200">
            <Card className="w-full max-w-5xl bg-zinc-900 border-zinc-800 p-0 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_100px_rgba(0,0,0,0.8)]">
              <View className="p-8 border-b border-zinc-800 flex-row justify-between items-center bg-black/20">
                <View>
                  <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest mb-1">Configuration</Text>
                  <Text className="text-white font-black uppercase text-3xl tracking-tighter italic">Slot: {activeSlotId}</Text>
                </View>
                <Button onClick={() => setActiveSlotId(null)} variant="ghost" className="w-12 h-12 p-0 bg-black rounded-2xl border border-zinc-800 items-center justify-center hover:bg-zinc-900">
                  <X size={24} className="text-zinc-500" />
                </Button>
              </View>

              <View className="flex-row flex-1 overflow-hidden">
                {/* Data Source Panel */}
                <View className="w-80 border-r border-zinc-800 p-8 gap-6 bg-black/10">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Data Provider</Text>
                  <View className="gap-2">
                    {[
                      { id: 'POS', icon: Database, label: 'POS Catalog', desc: 'Real-time menu data' },
                      { id: 'MEDIA', icon: ImageIcon, label: 'Media Library', desc: 'Brand assets & images' },
                      { id: 'STATIC', icon: Code, label: 'Static Text', desc: 'Manual JSON/Text entry' },
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
                          "h-24 flex flex-col items-start p-4 gap-2 border-zinc-800 hover:border-sky-500/50 hover:bg-sky-500/5 transition-all text-left",
                          activeScreen.slots[activeSlotId]?.sourceType === source.id && "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/20"
                        )}
                      >
                        <source.icon size={20} className={activeScreen.slots[activeSlotId]?.sourceType === source.id ? "text-sky-500" : "text-zinc-500"} />
                        <View>
                          <Text className="text-xs font-black uppercase text-white tracking-tight">{source.label}</Text>
                          <Text className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest leading-tight">{source.desc}</Text>
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
                      className="mt-auto text-red-500 hover:bg-red-500/10 gap-2 border border-red-500/20 h-12"
                    >
                      <Trash2 size={14} />
                      <Text className="text-[10px] font-black uppercase tracking-widest">Clear Slot</Text>
                    </Button>
                  )}
                </View>

                {/* Configuration Panel */}
                <View className="flex-1 bg-black/20 p-10 overflow-y-auto">
                  {!activeScreen.slots[activeSlotId] ? (
                    <View className="h-full items-center justify-center opacity-20">
                      <div className="w-24 h-24 rounded-full border-2 border-dashed border-zinc-700 flex items-center justify-center mb-6">
                        <Plus size={32} className="text-zinc-500" />
                      </div>
                      <Text className="text-zinc-500 font-black uppercase text-xs tracking-[0.2em]">Select provider to configure</Text>
                    </View>
                  ) : (
                    <View className="gap-10">
                      {activeScreen.slots[activeSlotId].sourceType === 'POS' && (
                        <View className="gap-8">
                          <View className="gap-4">
                            <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Menu Category</Text>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                              {categories.map(cat => (
                                <Button 
                                  key={cat.id}
                                  onClick={() => handleUpdateSlot(activeSlotId, {
                                    ...activeScreen.slots[activeSlotId],
                                    dataConfig: { ...activeScreen.slots[activeSlotId].dataConfig, filters: { categoryId: cat.id } }
                                  })}
                                  variant="outline"
                                  className={cn(
                                    "h-12 border-zinc-800 justify-start px-4 transition-all",
                                    activeScreen.slots[activeSlotId].dataConfig.filters?.categoryId === cat.id && "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/20"
                                  )}
                                >
                                  <div className={cn("w-1.5 h-1.5 rounded-full mr-3", activeScreen.slots[activeSlotId].dataConfig.filters?.categoryId === cat.id ? "bg-sky-500" : "bg-zinc-800")} />
                                  <Text className="text-white text-[10px] font-black uppercase tracking-tight truncate">{cat.name}</Text>
                                </Button>
                              ))}
                            </div>
                          </View>

                          <View className="gap-4">
                            <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Visual Component</Text>
                            <div className="flex-row gap-2">
                              {[
                                { id: 'MenuItemList', label: 'Classic Menu' },
                                { id: 'HeroItem', label: 'Hero Spotlight' },
                                { id: 'PriceGrid', label: 'Grid Pricing' }
                              ].map(comp => (
                                <Button 
                                  key={comp.id}
                                  onClick={() => handleUpdateSlot(activeSlotId, {
                                    ...activeScreen.slots[activeSlotId],
                                    component: comp.id,
                                    componentProps: comp.id === 'MenuItemList' ? { columns: 2, showDescription: true } : {}
                                  })}
                                  variant="outline"
                                  className={cn(
                                    "flex-1 h-14 border-zinc-800 flex flex-col items-center justify-center p-0",
                                    activeScreen.slots[activeSlotId].component === comp.id && "border-sky-500 bg-sky-500/5"
                                  )}
                                >
                                  <Text className="text-white text-[10px] font-black uppercase tracking-widest">{comp.label}</Text>
                                </Button>
                              ))}
                            </div>
                          </View>

                          {activeScreen.slots[activeSlotId].component === 'MenuItemList' && (
                            <View className="gap-6 p-6 bg-zinc-950 rounded-2xl border border-zinc-800">
                              <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Component Tuning</Text>
                              <View className="flex-row gap-8">
                                <View className="flex-1 gap-3">
                                  <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest ml-1">Grid Columns</Text>
                                  <div className="flex-row gap-1.5">
                                    {[1, 2, 3, 4].map(cols => (
                                      <Button 
                                        key={cols}
                                        onClick={() => handleUpdateSlot(activeSlotId, {
                                          ...activeScreen.slots[activeSlotId],
                                          componentProps: { ...activeScreen.slots[activeSlotId].componentProps, columns: cols }
                                        })}
                                        variant="outline"
                                        className={cn(
                                          "flex-1 h-10 border-zinc-800 p-0 text-xs font-mono",
                                          activeScreen.slots[activeSlotId].componentProps.columns === cols && "border-sky-500 bg-sky-500/10 text-sky-500"
                                        )}
                                      >
                                        {cols}
                                      </Button>
                                    ))}
                                  </div>
                                </View>
                                <View className="flex-1 gap-3">
                                  <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest ml-1">Item Detail</Text>
                                  <Button 
                                    onClick={() => handleUpdateSlot(activeSlotId, {
                                      ...activeScreen.slots[activeSlotId],
                                      componentProps: { ...activeScreen.slots[activeSlotId].componentProps, showDescription: !activeScreen.slots[activeSlotId].componentProps.showDescription }
                                    })}
                                    variant="outline"
                                    className={cn(
                                      "h-10 border-zinc-800 w-full flex flex-row gap-2 justify-center",
                                      activeScreen.slots[activeSlotId].componentProps.showDescription && "border-sky-500 bg-sky-500/10"
                                    )}
                                  >
                                    <Check size={14} className={activeScreen.slots[activeSlotId].componentProps.showDescription ? "text-sky-500" : "text-zinc-800"} />
                                    <Text className="text-white text-[10px] font-black uppercase">Show Descriptions</Text>
                                  </Button>
                                </View>
                              </View>
                            </View>
                          )}
                        </View>
                      )}

                      {activeScreen.slots[activeSlotId].sourceType === 'MEDIA' && (
                        <View className="gap-6 h-full flex flex-col">
                          <div className="flex flex-row justify-between items-center">
                            <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Selected Media Asset</Text>
                            <Button onClick={() => setShowImageSelector(true)} variant="outline" className="h-10 px-6 border-sky-500/30 bg-sky-500/5 hover:bg-sky-500/10">
                               <ImageIcon size={14} className="mr-2 text-sky-500" />
                               <span className="text-sky-500 font-black uppercase text-[10px]">Open Library</span>
                            </Button>
                          </div>
                          
                          {activeScreen.slots[activeSlotId].dataConfig.mediaId ? (
                            <div className="flex-1 relative rounded-3xl overflow-hidden border-2 border-zinc-800 bg-black group">
                               {/* We'd normally resolve the URL here if it's not external, for now let's just use it if available */}
                               <div className="absolute inset-0 flex flex-col items-center justify-center">
                                  <ImageIcon size={48} className="text-zinc-800 mb-4" />
                                  <Text className="text-zinc-600 font-mono text-[10px] uppercase">Asset Bound: {activeScreen.slots[activeSlotId].dataConfig.mediaId.substring(0, 8)}...</Text>
                               </div>
                            </div>
                          ) : (
                            <div 
                              onClick={() => setShowImageSelector(true)}
                              className="flex-1 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center cursor-pointer hover:border-zinc-700 hover:bg-white/5 transition-all"
                            >
                               <ImageIcon size={48} className="text-zinc-800 mb-4" />
                               <Text className="text-zinc-600 font-black uppercase tracking-widest text-[10px]">No asset selected</Text>
                            </div>
                          )}
                        </View>
                      )}

                      {activeScreen.slots[activeSlotId].sourceType === 'STATIC' && (
                        <View className="gap-6">
                          <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Static JSON Definition</Text>
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
                            className="w-full h-[400px] bg-black border border-zinc-800 rounded-2xl p-6 font-mono text-sm text-sky-500 outline-none focus:border-sky-500/50 transition-colors resize-none shadow-inner"
                            placeholder='{ "title": "Welcome", "body": "Scan QR Code to order" }'
                          />
                          <Text className="text-zinc-600 text-[8px] font-bold uppercase leading-relaxed italic">
                            Used for specialized components requiring static structured data.
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </View>
              
              <View className="p-8 border-t border-zinc-800 bg-black/20 flex flex-row justify-end">
                 <Button onClick={() => setActiveSlotId(null)} className="h-12 px-10 bg-sky-500 shadow-lg shadow-sky-500/20">
                    <span className="text-white font-black uppercase tracking-widest text-xs">Apply Configuration</span>
                 </Button>
              </View>
            </Card>
          </View>
        )}

        <LayoutTemplateSelector 
          open={showLayoutSelector}
          onSelect={handleSelectLayout}
          onCancel={() => {
            setShowLayoutSelector(false);
            if (!activeScreen.layoutId) onCancel();
          }}
        />

        <ImageSelector 
          open={showImageSelector}
          selectedId={activeSlotId ? activeScreen.slots[activeSlotId]?.dataConfig.mediaId : undefined}
          onSelect={(id, url) => {
            if (activeSlotId) {
              handleUpdateSlot(activeSlotId, {
                ...activeScreen.slots[activeSlotId],
                dataConfig: { ...activeScreen.slots[activeSlotId].dataConfig, mediaId: id }
              });
            }
            setShowImageSelector(false);
          }}
          onCancel={() => setShowImageSelector(false)}
        />
      </View>
    </View>
  );
}
