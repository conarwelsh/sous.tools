"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Card, Button, ScrollView, Logo } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { StickyNote, Plus, Settings, Trash2 } from "lucide-react";
import { LayoutDesigner } from "./LayoutDesigner";
import { Layout } from "../types/presentation.types";

export const LabelEditor = () => {
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLayout, setEditingLayout] = useState<Layout | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchLayouts = async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<Layout[]>("/presentation/layouts?type=LABEL");
      setLayouts(
        data.map((t) => ({
          ...t,
          structure:
            typeof t.structure === "string"
              ? JSON.parse(t.structure)
              : t.structure,
          content:
            typeof t.content === "string"
              ? JSON.parse(t.content)
              : t.content || {},
          config:
            typeof t.config === "string"
              ? JSON.parse(t.config)
              : t.config || {},
        })),
      );
    } catch (e) {
      console.error("Failed to fetch label templates", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const handleSave = async (layout: Partial<Layout>) => {
    try {
      const http = await getHttpClient();
      const payload = {
        ...layout,
        type: "LABEL",
        structure: JSON.stringify(layout.structure),
        content: JSON.stringify(layout.content),
        config: JSON.stringify(layout.config),
      };

      if (layout.id && layout.id !== "new") {
        await http.patch(`/presentation/layouts/${layout.id}`, payload);
      } else {
        await http.post("/presentation/layouts", payload);
      }
      setEditingLayout(null);
      setIsCreating(false);
      void fetchLayouts();
    } catch (e) {
      console.error("Failed to save label layout", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this label template?"))
      return;
    try {
      const http = await getHttpClient();
      await http.delete(`/presentation/layouts/${id}`);
      void fetchLayouts();
    } catch (e) {
      console.error("Failed to delete layout", e);
    }
  };

  if (editingLayout || isCreating) {
    return (
      <LayoutDesigner
        layout={
          editingLayout ||
          ({
            id: "new",
            name: "New Label",
            type: "LABEL",
            structure: { type: "container", styles: { flex: 1 }, children: [] },
            content: {},
            config: { dimensions: { width: 50, height: 30, unit: "mm" } },
          } as any)
        }
        onSave={handleSave}
        onCancel={() => {
          setEditingLayout(null);
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
            Label Designs
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Design and manage thermal label templates for prep and inventory.
          </p>
        </View>

        <Button
          onClick={() => setIsCreating(true)}
          className="bg-primary h-12 px-8"
        >
          <View className="flex-row items-center gap-2">
            <Plus size={16} className="text-primary-foreground" />
            <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              Design Label
            </span>
          </View>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 flex items-center justify-center">
          <Logo size={48} animate />
        </div>
      ) : layouts.length === 0 ? (
        <Card className="p-20 bg-card border-border border items-center justify-center">
          <div className="p-6 bg-muted rounded-full mb-6">
            <StickyNote size={48} className="text-primary" />
          </div>
          <Text className="text-foreground font-black uppercase tracking-tight text-xl mb-2">
            No Label Designs
          </Text>
          <Text className="text-muted-foreground text-sm font-medium mb-8 max-w-sm text-center">
            Create thermal label templates with dynamic data binding for
            expiration dates and barcodes.
          </Text>
          <Button
            onClick={() => setIsCreating(true)}
            className="h-12 px-8 bg-primary hover:bg-primary/90"
          >
            <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              Create First Template
            </span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => (
            <Card
              key={layout.id}
              className="p-6 bg-card border-border border-2 hover:border-primary/50 transition-all group"
            >
              <div className="aspect-[4/3] bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-border mb-6 flex items-center justify-center overflow-hidden relative">
                <StickyNote size={32} className="text-muted-foreground/30" />
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex flex-row justify-between items-start mb-6">
                <View className="flex-1">
                  <Text className="text-lg font-black text-foreground uppercase tracking-tight mb-1 truncate">
                    {layout.name}
                  </Text>
                  <Text className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Thermal {layout.config?.dimensions?.width || 50}x
                    {layout.config?.dimensions?.height || 30} Template
                  </Text>
                </View>
              </div>

              <div className="flex flex-row gap-2">
                <Button
                  onClick={() => setEditingLayout(layout)}
                  className="flex-1 h-10 bg-muted hover:bg-muted/80"
                >
                  <View className="flex-row items-center gap-2">
                    <Settings size={14} className="text-foreground" />
                    <span className="text-foreground text-[10px] font-black uppercase tracking-widest">
                      Edit Layout
                    </span>
                  </View>
                </Button>
                <Button
                  onClick={() => handleDelete(layout.id)}
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
