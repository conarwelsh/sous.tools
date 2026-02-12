"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Card, Button, ScrollView, Logo } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { Globe, Plus, Settings, ExternalLink, Trash2 } from "lucide-react";
import { Layout } from "../types/presentation.types";
import { ScreenEditor } from "./ScreenEditor";

export const PageManager = () => {
  const [pages, setPages] = useState<Layout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPage, setEditingPage] = useState<Layout | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPages = async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<Layout[]>("/presentation/layouts?type=PAGE");
      setPages(data.map(p => ({
        ...p,
        structure: typeof p.structure === 'string' ? JSON.parse(p.structure) : p.structure,
        content: typeof p.content === 'string' ? JSON.parse(p.content) : (p.content || {}),
        config: typeof p.config === 'string' ? JSON.parse(p.config) : (p.config || {})
      })));
    } catch (e) {
      console.error("Failed to fetch pages", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const handleSave = async (page: Partial<Layout>) => {
    try {
      const http = await getHttpClient();
      const payload = {
        ...page,
        type: 'PAGE',
        structure: JSON.stringify(page.structure),
        content: JSON.stringify(page.content),
        config: JSON.stringify(page.config)
      };

      if (page.id && page.id !== 'new') {
        await http.patch(`/presentation/layouts/${page.id}`, payload);
      } else {
        await http.post("/presentation/layouts", payload);
      }
      setEditingPage(null);
      setIsCreating(false);
      void fetchPages();
    } catch (e) {
      console.error("Failed to save page", e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page?")) return;
    try {
      const http = await getHttpClient();
      await http.delete(`/presentation/layouts/${id}`);
      void fetchPages();
    } catch (e) {
      console.error("Failed to delete page", e);
    }
  };

  if (editingPage || isCreating) {
    return (
      <ScreenEditor 
        screen={editingPage || {
          id: "new",
          name: "New Web Page",
          type: 'PAGE',
          structure: { type: 'container', styles: { flex: 1 }, children: [] },
          content: {},
          config: {}
        } as any} 
        onSave={handleSave} 
        onCancel={() => {
          setEditingPage(null);
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
            Web Pages
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Design and publish public-facing web pages for your organization.
          </p>
        </View>

        <Button onClick={() => setIsCreating(true)} className="bg-primary h-12 px-8">
          <View className="flex-row items-center gap-2">
            <Plus size={16} className="text-primary-foreground" />
            <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              New Page
            </span>
          </View>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 flex items-center justify-center">
          <Logo size={48} animate />
        </div>
      ) : pages.length === 0 ? (
        <Card className="p-20 bg-card border-border border items-center justify-center">
          <div className="p-6 bg-muted rounded-full mb-6">
            <Globe size={48} className="text-primary" />
          </div>
          <Text className="text-foreground font-black uppercase tracking-tight text-xl mb-2">
            No Pages Configured
          </Text>
          <Text className="text-muted-foreground text-sm font-medium mb-8 max-w-sm text-center">
            Create beautiful, responsive web pages using our layout designer. Perfect for menus, landing pages, and announcements.
          </Text>
          <Button onClick={() => setIsCreating(true)} className="h-12 px-8 bg-primary hover:bg-primary/90">
            <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              Create Your First Page
            </span>
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pages.map((page) => (
            <Card
              key={page.id}
              className="p-6 bg-card border-border border-2 hover:border-primary/50 transition-all group"
            >
              <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-border mb-6 flex items-center justify-center overflow-hidden relative">
                 <Globe size={32} className="text-zinc-300 dark:text-zinc-800" />
                 <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              <div className="flex flex-row justify-between items-start mb-2">
                <Text className="text-lg font-black text-foreground uppercase tracking-tight">
                    {page.name}
                </Text>
                <View className="flex-row gap-1">
                  {page.config?.webSlug && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-black text-emerald-500 uppercase tracking-widest">
                      Published
                    </div>
                  )}
                </View>
              </div>
              
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                {Object.keys(page.content || {}).length} Slots Configured
              </Text>

              <div className="flex flex-row gap-2">
                <Button onClick={() => setEditingPage(page)} className="flex-1 h-10 bg-muted hover:bg-muted/80">
                  <View className="flex-row items-center gap-2">
                    <Settings size={14} className="text-foreground" />
                    <span className="text-foreground text-[10px] font-black uppercase tracking-widest">
                      Edit Content
                    </span>
                  </View>
                </Button>
                <Button 
                  onClick={() => handleDelete(page.id)}
                  className="h-10 w-10 bg-muted hover:bg-destructive/20 flex items-center justify-center border-none"
                >
                  <Trash2 size={14} className="text-muted-foreground group-hover:text-destructive" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </ScrollView>
  );
};
