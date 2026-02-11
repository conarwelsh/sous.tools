"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Card, Button, Input, Logo, cn, ScrollView, Dialog, DialogContent, DialogHeader, DialogTitle } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { Search, Layout, Tag as TagIcon, X } from "lucide-react";
import { LayoutTemplate } from "../../types/presentation.types";
import { TemplateSkeletonRenderer } from "./TemplateSkeletonRenderer";

interface LayoutTemplateSelectorProps {
  onSelect: (template: LayoutTemplate) => void;
  onCancel: () => void;
  open: boolean;
}

export const LayoutTemplateSelector: React.FC<LayoutTemplateSelectorProps> = ({
  onSelect,
  onCancel,
  open,
}) => {
  const [templates, setTemplates] = useState<LayoutTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchTemplates = async () => {
      setIsLoading(true);
      try {
        const http = await getHttpClient();
        const data = await http.get<any[]>("/presentation/templates");
        setTemplates(data.map(t => ({
          ...t,
          root: typeof t.structure === 'string' ? JSON.parse(t.structure) : t.structure
        })));
      } catch (e) {
        console.error("Failed to fetch templates", e);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTemplates();
  }, [open]);

  const allTags = Array.from(new Set(templates.flatMap(t => t.tags || [])));

  const filteredTemplates = templates.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !selectedTag || (t.tags || []).includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0 border-zinc-800 bg-[#0a0a0a]">
        <DialogHeader className="p-8 border-b border-zinc-800">
          <div className="flex flex-row justify-between items-end">
            <View>
              <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                Select Layout
              </DialogTitle>
              <Text className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                Choose a structural foundation for your content.
              </Text>
            </View>
          </div>
        </DialogHeader>

        <View className="flex-row flex-1 overflow-hidden">
          {/* Filters Sidebar */}
          <View className="w-64 border-r border-zinc-800 p-6 gap-8 bg-black/20">
            <View className="gap-4">
              <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Search</Text>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by name..."
                  className="h-10 pl-10 bg-black border-zinc-800 text-xs"
                />
              </div>
            </View>

            <View className="gap-4">
              <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Filter by Tag</Text>
              <View className="flex flex-col gap-1.5">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedTag(null)}
                  className={cn(
                    "justify-start h-9 px-3 gap-3",
                    !selectedTag ? "bg-sky-500/10 text-sky-500" : "text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  <TagIcon size={12} />
                  <span className="text-[10px] font-black uppercase">All Templates</span>
                </Button>
                {allTags.map(tag => (
                  <Button 
                    key={tag}
                    variant="ghost" 
                    onClick={() => setSelectedTag(tag)}
                    className={cn(
                      "justify-start h-9 px-3 gap-3",
                      selectedTag === tag ? "bg-sky-500/10 text-sky-500" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    <TagIcon size={12} />
                    <span className="text-[10px] font-black uppercase">{tag}</span>
                  </Button>
                ))}
              </View>
            </View>
          </View>

          {/* Grid Area */}
          <ScrollView className="flex-1 p-8">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Logo size={32} animate />
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-20">
                <Layout size={48} className="text-zinc-500 mb-4" />
                <Text className="text-zinc-500 font-black uppercase text-xs">No matching layouts found</Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((t) => (
                  <Card 
                    key={t.id}
                    onClick={() => onSelect(t)}
                    className="p-4 bg-zinc-900 border-zinc-800 border-2 hover:border-sky-500 cursor-pointer transition-all group overflow-hidden"
                  >
                    <div className="aspect-video bg-black rounded-lg border border-zinc-800 mb-4 items-center justify-center relative overflow-hidden">
                       <div className="scale-50 w-[200%] h-[200%] origin-top-left pointer-events-none">
                          <TemplateSkeletonRenderer node={t.root} />
                       </div>
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button className="bg-sky-500 h-10 px-6">
                             <span className="text-white font-black uppercase tracking-widest text-[10px]">Select Template</span>
                          </Button>
                       </div>
                    </div>
                    <Text className="text-white font-black uppercase text-xs mb-1 truncate">{t.name}</Text>
                    <div className="flex flex-row flex-wrap gap-1">
                      {t.isSystem && (
                        <div className="px-1.5 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-[6px] font-black text-sky-500 uppercase">System</div>
                      )}
                      {(t.tags || []).map(tag => (
                        <div key={tag} className="px-1.5 py-0.5 bg-zinc-800 rounded text-[6px] font-black text-zinc-500 uppercase">{tag}</div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollView>
        </View>
      </DialogContent>
    </Dialog>
  );
};
