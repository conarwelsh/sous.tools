"use client";

import React, { useState } from "react";
import { View, Text, Button, Card, Input } from "@sous/ui";
import { TemplateStage } from "./shared/TemplateStage.js";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer.js";
import { LayoutNode, LayoutTemplate } from "../types/presentation.types.js";
import { 
  ChevronLeft, 
  Save, 
  Grid3X3, 
  Square, 
  Layers, 
  Maximize,
  Settings,
  Code
} from "lucide-react";

export interface LayoutDesignerProps {
  template?: LayoutTemplate;
  onSave: (template: LayoutTemplate) => void;
  onCancel: () => void;
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
  children: [
    {
      type: "slot",
      id: "main-content",
      name: "Main Content",
      styles: {
        flex: 1,
      }
    }
  ]
};

export function LayoutDesigner({
  template,
  onSave,
  onCancel,
}: LayoutDesignerProps) {
  const [activeTemplate, setActiveTemplate] = useState<LayoutTemplate>(
    template || {
      id: "new-layout",
      name: "Untitled Layout",
      tags: [],
      root: DEFAULT_ROOT,
    }
  );
  const [showJson, setShowJson] = useState(false);

  const handleUpdateNode = (node: LayoutNode) => {
    setActiveTemplate(prev => ({
      ...prev,
      root: node
    }));
  };

  const handleSave = () => {
    onSave(activeTemplate);
  };

  return (
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

        <View className="flex-1 p-6 gap-8">
          {/* General Settings */}
          <View className="gap-4">
            <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">
              General Settings
            </Text>
            <View className="gap-2">
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Layout Name</Text>
              <Input 
                value={activeTemplate.name}
                onChange={(e) => setActiveTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="h-10 bg-black/40 border-zinc-800 text-xs" 
              />
            </View>
          </View>

          {/* Draggable Palette Placeholder */}
          <View className="gap-4">
            <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">
              Elements
            </Text>
            <View className="grid grid-cols-2 gap-2">
              <Card className="p-4 bg-black/40 border-zinc-800 items-center justify-center cursor-move hover:border-sky-500/50 transition-colors">
                <Grid3X3 size={20} className="text-zinc-600 mb-2" />
                <Text className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest">Grid Row</Text>
              </Card>
              <Card className="p-4 bg-black/40 border-zinc-800 items-center justify-center cursor-move hover:border-sky-500/50 transition-colors">
                <Square size={20} className="text-zinc-600 mb-2" />
                <Text className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest">Slot</Text>
              </Card>
              <Card className="p-4 bg-black/40 border-zinc-800 items-center justify-center cursor-move hover:border-sky-500/50 transition-colors">
                <Maximize size={20} className="text-zinc-600 mb-2" />
                <Text className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest">Fixed Box</Text>
              </Card>
              <Card className="p-4 bg-black/40 border-zinc-800 items-center justify-center cursor-move hover:border-sky-500/50 transition-colors">
                <Layers size={20} className="text-zinc-600 mb-2" />
                <Text className="text-zinc-500 font-bold uppercase text-[8px] tracking-widest">Overlay</Text>
              </Card>
            </View>
          </View>
        </View>

        <View className="p-6 border-t border-zinc-800 gap-2">
          <Button 
            onClick={() => setShowJson(!showJson)}
            variant="outline" 
            className="w-full h-12 border-zinc-800 hover:bg-zinc-800"
          >
            <View className="flex-row items-center gap-2">
              <Code size={16} className="text-zinc-500" />
              <Text className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                {showJson ? "Hide JSON" : "View JSON"}
              </Text>
            </View>
          </Button>
          <Button 
            onClick={handleSave}
            className="w-full h-12 bg-white hover:bg-zinc-200"
          >
            <View className="flex-row items-center gap-2">
              <Save size={16} className="text-black" />
              <Text className="text-black font-black uppercase tracking-widest text-[10px]">
                Save Template
              </Text>
            </View>
          </Button>
        </View>
      </View>

      {/* Main Canvas */}
      <View className="flex-1 relative">
        <TemplateStage isEditMode>
          <TemplateSkeletonRenderer 
            node={activeTemplate.root} 
            isEditMode
            onSlotClick={(id) => console.log('Slot clicked:', id)}
          />
        </TemplateStage>

        {/* Floating Property Bar Placeholder */}
        <View className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl border border-zinc-800 p-2 rounded-2xl flex-row items-center gap-2 shadow-2xl">
           <Button variant="ghost" className="h-10 px-4 gap-2">
              <Settings size={14} className="text-zinc-500" />
              <Text className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Layout Properties</Text>
           </Button>
        </View>

        {/* JSON Editor Modal Placeholder */}
        {showJson && (
          <View className="absolute inset-0 bg-black/90 z-50 p-12">
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
      </View>
    </View>
  );
}
