"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Card, Button, ScrollView, Logo } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { Monitor, Plus, Settings, ExternalLink, Trash2 } from "lucide-react";
import { ScreenConfig } from "../types/presentation.types";
import { ScreenEditor } from "./ScreenEditor";

export const ScreenManager = () => {
  const [screens, setScreens] = useState<ScreenConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingScreen, setEditingScreen] = useState<ScreenConfig | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchScreens = async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<any[]>("/presentation/screens");
      // Map to proper ScreenConfig type if needed
      setScreens(data.map(s => ({
        ...s,
        slots: typeof s.slots === 'string' ? JSON.parse(s.slots) : (s.slots || {}),
        assignments: typeof s.assignments === 'string' ? JSON.parse(s.assignments) : (s.assignments || {})
      })));
    } catch (e) {
      console.error("Failed to fetch screens", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const handleSave = async (screen: ScreenConfig) => {
    try {
      const http = await getHttpClient();
      const payload = {
        ...screen,
        slots: JSON.stringify(screen.slots),
        assignments: JSON.stringify(screen.assignments)
      };

      if (editingScreen?.id && editingScreen.id !== 'new') {
        await http.patch(`/presentation/screens/${editingScreen.id}`, payload);
      } else {
        await http.post("/presentation/screens", payload);
      }
      setEditingScreen(null);
      setIsCreating(false);
      void fetchScreens();
    } catch (e) {
      console.error("Failed to save screen", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this screen?")) return;
    try {
      const http = await getHttpClient();
      await http.delete(`/presentation/screens/${id}`);
      void fetchScreens();
    } catch (e) {
      console.error("Failed to delete screen", e);
    }
  };

  if (editingScreen || isCreating) {
    return (
      <ScreenEditor 
        screen={editingScreen || {
          id: "new",
          name: "New Screen",
          layoutId: "",
          slots: {},
          assignments: {}
        }} 
        onSave={handleSave} 
        onCancel={() => {
          setEditingScreen(null);
          setIsCreating(false);
        }} 
      />
    );
  }

  return (
    <ScrollView className="flex-1 p-6">
      <div className="flex flex-row justify-between items-end mb-12">
        <View>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Screen Manager
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            Manage your digital signage content and hardware assignments.
          </p>
        </View>

        <Button onClick={() => setIsCreating(true)} className="bg-sky-500 h-12 px-8">
          <View className="flex-row items-center gap-2">
            <Plus size={16} className="text-white" />
            <span className="text-white font-black uppercase tracking-widest text-xs">
              New Screen
            </span>
          </View>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 flex items-center justify-center">
          <Logo size={48} animate />
        </div>
      ) : screens.length === 0 ? (
        <Card className="p-20 bg-zinc-900/50 border-zinc-800 border-2 items-center justify-center border-dashed">
          <Monitor size={48} className="text-zinc-700 mb-4" />
          <Text className="text-zinc-500 font-bold uppercase tracking-widest text-sm mb-6">
            No screens configured yet
          </Text>
          <Button onClick={() => setIsCreating(true)} variant="outline" className="border-zinc-700">
            Create your first screen
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => (
            <Card
              key={screen.id}
              className="p-6 bg-zinc-900 border-zinc-800 border-2 hover:border-zinc-700 transition-all group"
            >
              <div className="aspect-video bg-black rounded-xl border border-zinc-800 mb-6 flex items-center justify-center overflow-hidden relative">
                 <Monitor size={32} className="text-zinc-800" />
                 <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex flex-row justify-between items-start mb-2">
                <Text className="text-lg font-black text-white uppercase tracking-tight">
                    {screen.name}
                </Text>
                <View className="flex-row gap-1">
                  {screen.assignments.webSlug && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                      Live
                    </div>
                  )}
                </View>
              </div>
              
              <Text className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-6">
                {Object.keys(screen.slots).length} Slots Populated
              </Text>

              <div className="flex flex-row gap-2">
                <Button onClick={() => setEditingScreen(screen)} className="flex-1 h-10 bg-zinc-800 hover:bg-zinc-700">
                  <View className="flex-row items-center gap-2">
                    <Settings size={14} className="text-white" />
                    <span className="text-white text-[10px] font-black uppercase tracking-widest">
                      Configure
                    </span>
                  </View>
                </Button>
                <Button 
                  onClick={() => handleDelete(screen.id)}
                  className="h-10 w-10 bg-zinc-800 hover:bg-red-500/20 flex items-center justify-center border-none"
                >
                  <Trash2 size={14} className="text-zinc-500 group-hover:text-red-500" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScrollView>
  );
};
