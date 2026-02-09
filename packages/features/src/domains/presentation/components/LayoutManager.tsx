"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Card, Button, Input, ScrollView, Logo } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { LayoutEditor } from "./LayoutEditor";

export const LayoutManager = () => {
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<any[]>("/presentation/templates");
      setTemplates(data);
    } catch (e) {
      console.error("Failed to fetch templates", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleSave = async (data: any) => {
    try {
      const http = await getHttpClient();
      if (editingTemplate) {
        await http.patch(`/presentation/templates/${editingTemplate.id}`, data);
      } else {
        await http.post("/presentation/templates", data);
      }
      setEditingTemplate(null);
      setIsCreating(false);
      void fetchTemplates();
    } catch (e) {
      console.error("Failed to save template", e);
    }
  };

  if (editingTemplate || isCreating) {
    return (
      <View className="flex-1 p-6">
        <LayoutEditor 
          template={editingTemplate} 
          onSave={handleSave} 
          onCancel={() => {
            setEditingTemplate(null);
            setIsCreating(false);
          }} 
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 p-6">
      <div className="flex flex-row justify-between items-end mb-12">
        <View>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Layout Manager
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            Design structural skeletons for your digital displays.
          </p>
        </View>

        <Button onClick={() => setIsCreating(true)} className="bg-sky-500 h-12 px-8">
          <span className="text-white font-black uppercase tracking-widest text-xs">
            New Template
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 flex items-center justify-center">
          <Logo variant="cloud" size={48} animate />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="p-6 bg-zinc-900 border-zinc-800 border-2 hover:border-zinc-700 transition-all group"
            >
              <div className="aspect-video bg-black rounded-xl border border-zinc-800 mb-6 flex items-center justify-center overflow-hidden">
                 {/* Visual Representation of Grid */}
                 <div className="w-full h-full p-2 grid grid-cols-2 gap-1 opacity-20">
                    <div className="bg-sky-500/50 rounded-sm"></div>
                    <div className="bg-sky-500/50 rounded-sm"></div>
                 </div>
                 <div className="absolute">
                    <Logo variant="cloud" size={32} />
                 </div>
              </div>

              <div className="flex flex-row justify-between items-start mb-2">
                <Text className="text-lg font-black text-white uppercase tracking-tight">
                    {template.name}
                </Text>
                {template.isSystem && (
                   <div className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded text-[8px] font-black text-sky-500 uppercase tracking-widest">
                      System
                   </div>
                )}
              </div>
              
              <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">
                {JSON.parse(template.structure).layout} layout • {JSON.parse(template.structure).slots?.length || 0} Slots
              </Text>

              <div className="flex flex-row gap-2">
                <Button onClick={() => setEditingTemplate(template)} className="flex-1 h-10 bg-zinc-800 hover:bg-zinc-700">
                  <span className="text-white text-[10px] font-black uppercase tracking-widest">
                    Edit Structure
                  </span>
                </Button>
                {!template.isSystem && (
                   <Button className="h-10 w-10 bg-zinc-800 hover:bg-destructive/20 flex items-center justify-center">
                     <span className="text-white text-[10px] font-black">×</span>
                   </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScrollView>
  );
};
