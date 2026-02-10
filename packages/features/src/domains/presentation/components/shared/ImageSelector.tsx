"use client";

import React, { useState, useEffect, useCallback } from "react";
import { View, Text, Card, Button, Input, Logo, cn, ScrollView, Dialog, DialogContent, DialogHeader, DialogTitle } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { Search, Image as ImageIcon, Upload, Link as LinkIcon, X, Check } from "lucide-react";

interface ImageSelectorProps {
  onSelect: (mediaId: string, url: string) => void;
  onCancel: () => void;
  open: boolean;
  selectedId?: string;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({
  onSelect,
  onCancel,
  open,
  selectedId,
}) => {
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"gallery" | "upload" | "url">("gallery");
  const [externalUrl, setExternalUrl] = useState("");

  const fetchMedia = useCallback(async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<any[]>("/media");
      setMedia(data);
    } catch (e) {
      console.error("Failed to fetch media", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void fetchMedia();
    }
  }, [open, fetchMedia]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const http = await getHttpClient();
      const formData = new FormData();
      formData.append("file", file);
      
      const response = await http.post<any>("/media/upload", formData);
      await fetchMedia();
      onSelect(response.id, response.url);
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIsUploading(false);
    }
  };

  const filteredMedia = media.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-4xl h-[70vh] flex flex-col p-0 border-zinc-800 bg-[#0a0a0a]">
        <DialogHeader className="p-8 border-b border-zinc-800">
          <div className="flex flex-row justify-between items-end">
            <View>
              <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter mb-2">
                Media Library
              </DialogTitle>
              <Text className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
                Select or upload assets for your presentation.
              </Text>
            </View>
          </div>
        </DialogHeader>

        {/* Tabs */}
        <View className="flex-row border-b border-zinc-800 px-8">
          {[
            { id: "gallery", label: "Gallery", icon: ImageIcon },
            { id: "upload", label: "Upload New", icon: Upload },
            { id: "url", label: "External URL", icon: LinkIcon },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "h-14 rounded-none px-6 gap-2 border-b-2 transition-all",
                activeTab === tab.id ? "bg-white/5 border-sky-500 text-white" : "border-transparent text-zinc-500"
              )}
            >
              <tab.icon size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest">{tab.label}</span>
            </Button>
          ))}
        </View>

        <View className="flex-1 overflow-hidden">
          {activeTab === "gallery" && (
            <View className="flex-1 flex flex-col">
              <div className="p-6 border-b border-zinc-800/50 bg-black/20">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <Input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Filter by filename..."
                    className="h-10 pl-10 bg-black border-zinc-800 text-xs"
                  />
                </div>
              </div>
              <ScrollView className="flex-1 p-6">
                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <Logo size={32} animate />
                  </div>
                ) : filteredMedia.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 opacity-20">
                    <ImageIcon size={48} className="text-zinc-500 mb-4" />
                    <Text className="text-zinc-500 font-black uppercase text-xs">No media found</Text>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredMedia.map((item) => (
                      <Card 
                        key={item.id}
                        onClick={() => onSelect(item.id, item.url)}
                        className={cn(
                          "aspect-square bg-zinc-900 border-2 transition-all cursor-pointer group relative overflow-hidden",
                          selectedId === item.id ? "border-sky-500" : "border-zinc-800 hover:border-zinc-700"
                        )}
                      >
                        <img src={item.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={item.name} />
                        <div className="absolute inset-0 bg-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {selectedId === item.id && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-sky-500 rounded-full flex items-center justify-center shadow-lg">
                            <Check size={14} className="text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 translate-y-full group-hover:translate-y-0 transition-transform">
                           <Text className="text-[8px] font-bold text-white uppercase truncate">{item.name}</Text>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollView>
            </View>
          )}

          {activeTab === "upload" && (
            <View className="flex-1 items-center justify-center p-12">
              <div className="w-full max-w-md p-12 border-2 border-dashed border-zinc-800 rounded-3xl bg-black/40 flex flex-col items-center text-center">
                {isUploading ? (
                  <>
                    <Logo size={48} animate className="mb-6" />
                    <Text className="text-sky-500 font-black uppercase tracking-widest text-xs animate-pulse">Processing Asset...</Text>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-6">
                      <Upload size={24} className="text-zinc-500" />
                    </div>
                    <Text className="text-white font-black uppercase text-lg mb-2">Upload Image</Text>
                    <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-8 leading-relaxed">
                      Files will be automatically optimized for signage hardware.
                    </Text>
                    <label className="bg-sky-500 h-12 px-8 rounded-xl cursor-pointer hover:bg-sky-400 transition-colors flex items-center justify-center">
                      <span className="text-white font-black uppercase tracking-widest text-[10px]">Choose File</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  </>
                )}
              </div>
            </View>
          )}

          {activeTab === "url" && (
            <View className="flex-1 items-center justify-center p-12">
              <div className="w-full max-w-md gap-6 flex flex-col">
                <View className="gap-2">
                  <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">Image URL</Text>
                  <Input 
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-12 bg-black border-zinc-800 text-sm font-mono text-sky-500"
                  />
                </View>
                <Button 
                  onClick={() => onSelect('external', externalUrl)}
                  disabled={!externalUrl}
                  className="bg-sky-500 h-12"
                >
                  <span className="text-white font-black uppercase tracking-widest text-[10px]">Use External Asset</span>
                </Button>
              </div>
            </View>
          )}
        </View>
      </DialogContent>
    </Dialog>
  );
};
