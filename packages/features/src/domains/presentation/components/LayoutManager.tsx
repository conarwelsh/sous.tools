"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Card, Button, ScrollView, Logo } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { useRouter } from "next/navigation";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer";
import { Layout } from "../types/presentation.types";
import { Layout as LayoutIcon } from "lucide-react";

export const LayoutManager = () => {
  const router = useRouter();
  const [layouts, setLayouts] = useState<Layout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLayouts = async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<Layout[]>("/presentation/templates");
      setLayouts(data);
    } catch (e) {
      console.error("Failed to fetch templates", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLayouts();
  }, []);

  const countSlots = (node: any): number => {
    if (!node) return 0;
    let count = node.type === 'slot' ? 1 : 0;
    if (node.children && Array.isArray(node.children)) {
      count += node.children.reduce((acc: number, child: any) => acc + countSlots(child), 0);
    }
    return count;
  };

  const handleCreate = () => {
    router.push("/presentation/layouts/new");
  };

  const handleEdit = (id: string) => {
    router.push(`/presentation/layouts/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this template?")) return;
    
    try {
      const http = await getHttpClient();
      await http.delete(`/presentation/layouts/${id}`);
      void fetchLayouts();
    } catch (e) {
      console.error("Failed to delete layout", e);
    }
  };

  return (
    <ScrollView className="flex-1 p-6">
      <div className="flex flex-row justify-between items-end mb-12">
        <View>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">
            Layout Manager
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Design structural skeletons for your digital displays.
          </p>
        </View>

        <Button onClick={handleCreate} className="bg-primary h-12 px-8">
          <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
            New Template
          </span>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 flex items-center justify-center">
          <Logo size={48} animate />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {layouts.map((layout) => {
            const structure = typeof layout.structure === 'string' 
              ? JSON.parse(layout.structure) 
              : layout.structure;
            
            return (
              <Card
                key={layout.id}
                className="p-6 bg-card border-border border-2 hover:border-primary/50 transition-all group overflow-hidden"
              >
                <div className="aspect-video bg-black rounded-xl border border-border mb-6 flex items-center justify-center overflow-hidden relative">
                   <div className="scale-[0.4] w-[250%] h-[250%] origin-top-left pointer-events-none">
                      {structure && structure.type ? (
                        <TemplateSkeletonRenderer node={structure} />
                      ) : (
                        <View className="flex-1 items-center justify-center bg-muted/10">
                          <LayoutIcon className="text-muted-foreground/20" size={120} />
                        </View>
                      )}
                   </div>
                   <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Logo size={32} animate />
                   </div>
                </div>

                <div className="flex flex-row justify-between items-start mb-2">
                  <Text className="text-lg font-black text-foreground uppercase tracking-tight">
                      {layout.name}
                  </Text>
                  {layout.isSystem && (
                     <div className="bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded text-[8px] font-black text-sky-500 uppercase tracking-widest">
                        System
                     </div>
                  )}
                </div>
                
                <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                  {structure?.layout || (structure?.type === 'container' ? (structure?.styles?.display === 'grid' ? 'Grid' : 'Flex') : 'Flex')} layout • {countSlots(structure)} Slots
                </Text>

                <div className="flex flex-row gap-2">
                  <Button onClick={() => handleEdit(layout.id)} className="flex-1 h-10 bg-muted hover:bg-muted/80">
                    <span className="text-foreground text-[10px] font-black uppercase tracking-widest">
                      Edit Structure
                    </span>
                  </Button>
                                  {!layout.isSystem && (
                                     <Button 
                                      onClick={() => handleDelete(layout.id)}
                                      className="h-10 w-10 bg-muted hover:bg-destructive/20 flex items-center justify-center border-none"
                                     >
                                       <span className="text-foreground text-[10px] font-black">×</span>
                                     </Button>
                                  )}                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ScrollView>
  );
};
