"use client";

import React, { useState } from "react";
import { View, Text, Button, ScrollView, Card } from "@sous/ui";
import { ChevronRight, ChevronLeft, Save, Trash2, Eye } from "lucide-react";

export interface IngestionReviewerProps {
  sourceImage: string;
  onSave: (data: any) => void;
  onCancel: () => void;
  children: React.ReactNode;
  title?: string;
}

export function IngestionReviewer({
  sourceImage,
  onSave,
  onCancel,
  children,
  title = "Review Extraction",
}: IngestionReviewerProps) {
  const [zoom, setZoom] = useState(1);

  return (
    <View className="flex-1 flex-row h-screen bg-background">
      {/* Left Panel: Source Document */}
      <View className="flex-1 relative border-r border-border bg-muted/30 overflow-hidden">
        <View className="absolute top-6 left-6 z-10 flex-row gap-2">
          <View className="bg-card/60 backdrop-blur-xl border border-border p-3 rounded-2xl flex-row items-center gap-4">
            <View className="flex-row items-center gap-2 border-r border-border pr-4">
              <Eye size={14} className="text-primary" />
              <Text className="text-foreground font-black uppercase text-[10px] tracking-widest">
                Source Document
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <button 
                onClick={() => setZoom(prev => Math.max(0.5, prev - 0.2))}
                className="w-6 h-6 items-center justify-center rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                -
              </button>
              <Text className="text-muted-foreground font-mono text-[10px] w-8 text-center">
                {(zoom * 100).toFixed(0)}%
              </Text>
              <button 
                onClick={() => setZoom(prev => Math.min(3, prev + 0.2))}
                className="w-6 h-6 items-center justify-center rounded bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                +
              </button>
            </View>
          </View>
        </View>

        <ScrollView 
          className="flex-1"
        >
          <div className="min-h-full flex items-center justify-center">
            <div 
              style={{ 
                transform: `scale(${zoom})`, 
                transition: 'transform 0.2s ease-out',
                transformOrigin: 'center center'
              }}
              className="shadow-2xl shadow-foreground/5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={sourceImage} 
                alt="Source document" 
                className="max-w-[90%] h-auto rounded-sm border border-border" 
              />
            </div>
          </div>
        </ScrollView>
      </View>

      {/* Right Panel: Data Review Form */}
      <View className="w-[500px] bg-card border-l border-border flex flex-col">
        <View className="p-6 border-b border-border flex-row justify-between items-center bg-muted/10">
          <View>
            <Text className="text-primary font-black uppercase text-[10px] tracking-widest mb-1">
              Verification Required
            </Text>
            <Text className="text-xl font-black text-foreground uppercase tracking-tight">
              {title}
            </Text>
          </View>
          <Button 
            onClick={onCancel}
            variant="ghost" 
            className="w-10 h-10 rounded-full items-center justify-center p-0"
          >
            <Trash2 size={18} className="text-muted-foreground hover:text-destructive transition-colors" />
          </Button>
        </View>

        <ScrollView className="flex-1 p-6">
          <View className="gap-8 pb-32">
            {children}
          </View>
        </ScrollView>

        <View className="p-6 border-t border-border bg-background/40 backdrop-blur-xl flex-row gap-4">
          <Button 
            onClick={onCancel}
            variant="outline" 
            className="flex-1 h-12 border-border"
          >
            <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
              Discard
            </Text>
          </Button>
          <Button 
            onClick={onSave}
            className="flex-[2] h-12"
          >
            <View className="flex-row items-center gap-2">
              <Save size={16} className="text-primary-foreground" />
              <Text className="text-primary-foreground font-black uppercase tracking-widest text-[10px]">
                Commit to Ledger
              </Text>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
}
