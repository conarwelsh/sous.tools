"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Card, Button, ScrollView, Logo } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { Monitor, Plus, Settings, ExternalLink, Trash2 } from "lucide-react";
import { Layout } from "../types/presentation.types";
import { ScreenEditor } from "./ScreenEditor";

export const ScreenManager = () => {
  const [screens, setScreens] = useState<Layout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingScreen, setEditingScreen] = useState<Layout | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchScreens = async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<Layout[]>(
        "/presentation/layouts?type=SCREEN",
      );
      setScreens(
        data.map((s) => ({
          ...s,
          structure:
            typeof s.structure === "string"
              ? JSON.parse(s.structure)
              : s.structure,
          content:
            typeof s.content === "string"
              ? JSON.parse(s.content)
              : s.content || {},
          config:
            typeof s.config === "string"
              ? JSON.parse(s.config)
              : s.config || {},
        })),
      );
    } catch (e) {
      console.error("Failed to fetch screens", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScreens();
  }, []);

  const handleSave = async (screen: Partial<Layout>) => {
    try {
      const http = await getHttpClient();
      const payload = {
        ...screen,
        type: "SCREEN",
        structure: JSON.stringify(screen.structure),
        content: JSON.stringify(screen.content),
        config: JSON.stringify(screen.config),
      };

      if (screen.id && screen.id !== "new") {
        await http.patch(`/presentation/layouts/${screen.id}`, payload);
      } else {
        await http.post("/presentation/layouts", payload);
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
      await http.delete(`/presentation/layouts/${id}`);
      void fetchScreens();
    } catch (e) {
      console.error("Failed to delete screen", e);
    }
  };

  if (editingScreen || isCreating) {
    return (
      <ScreenEditor
        screen={
          editingScreen ||
          ({
            id: "new",
            name: "New Display",
            type: "SCREEN",
            structure: { type: "container", styles: { flex: 1 }, children: [] },
            content: {},
            config: {},
          } as any)
        }
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
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">
            Signage Manager
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Manage your digital signage content and hardware assignments.
          </p>
        </View>

        <Button
          onClick={() => setIsCreating(true)}
          className="bg-primary h-12 px-8"
        >
          <View className="flex-row items-center gap-2">
            <Plus size={16} className="text-primary-foreground" />
            <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              New Display
            </span>
          </View>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 flex items-center justify-center">
          <Logo size={48} animate />
        </div>
      ) : screens.length === 0 ? (
        <Card className="p-20 bg-card border-border border items-center justify-center">
          <div className="p-6 bg-muted rounded-full mb-6">
            <Monitor size={48} className="text-primary" />
          </div>
          <Text className="text-foreground font-black uppercase tracking-tight text-xl mb-2">
            No Signage Configured
          </Text>
          <Text className="text-muted-foreground text-sm font-medium mb-8 max-w-sm text-center">
            Connect your physical displays to digital signage content. Manage
            layouts, schedules, and device assignments in one place.
          </Text>
          <Button
            onClick={() => setIsCreating(true)}
            className="h-12 px-8 bg-primary hover:bg-primary/90"
          >
            <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              Create Your First Signage
            </span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => (
            <Card
              key={screen.id}
              className="p-6 bg-card border-border border-2 hover:border-primary/50 transition-all group"
            >
              <div className="aspect-video bg-black rounded-xl border border-border mb-6 flex items-center justify-center overflow-hidden relative">
                <Monitor size={32} className="text-zinc-800" />
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex flex-row justify-between items-start mb-2">
                <Text className="text-lg font-black text-foreground uppercase tracking-tight">
                  {screen.name}
                </Text>
                <View className="flex-row gap-1">
                  {screen.config?.webSlug && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                      Live
                    </div>
                  )}
                </View>
              </div>

              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                {Object.keys(screen.content || {}).length} Slots Populated
              </Text>

              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => setEditingScreen(screen)}
                  className="flex-1 h-10 bg-muted hover:bg-muted/80"
                >
                  <View className="flex-row items-center gap-2">
                    <Settings size={14} className="text-foreground" />
                    <span className="text-foreground text-[10px] font-black uppercase tracking-widest">
                      Configure
                    </span>
                  </View>
                </Button>
                <Button
                  onClick={() => handleDelete(screen.id)}
                  className="h-10 w-10 bg-muted hover:bg-destructive/20 flex items-center justify-center border-none"
                >
                  <Trash2
                    size={14}
                    className="text-muted-foreground group-hover:text-destructive"
                  />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScrollView>
  );
};
