"use client";

import React, { useState } from "react";
import { View, Text, Input, Button } from "@sous/ui";
import { Search, Check, AlertCircle, Plus } from "lucide-react";

export interface EntityMapperProps {
  originalText: string;
  suggestedMatch?: { id: string; name: string; confidence: number };
  onMatch: (entityId: string) => void;
  onCreateNew?: (name: string) => void;
  isLoading?: boolean;
}

export function EntityMapper({
  originalText,
  suggestedMatch,
  onMatch,
  onCreateNew,
  isLoading = false,
}: EntityMapperProps) {
  const [searchTerm, setSearchText] = useState(suggestedMatch?.name || "");
  const [isEditing, setIsEditing] = useState(!suggestedMatch || suggestedMatch.confidence < 0.9);

  const confidenceColor = () => {
    if (!suggestedMatch) return "text-zinc-500";
    if (suggestedMatch.confidence >= 0.9) return "text-emerald-500";
    if (suggestedMatch.confidence >= 0.6) return "text-amber-500";
    return "text-rose-500";
  };

  return (
    <View className="bg-card/50 border border-border p-4 rounded-2xl">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest mb-1">
            Detected Text
          </Text>
          <Text className="text-foreground font-mono text-xs uppercase">
            {originalText}
          </Text>
        </View>
        
        {suggestedMatch && !isEditing && (
          <View className="items-end">
            <View className={`flex-row items-center gap-1 mb-1 ${confidenceColor()}`}>
              <Check size={10} />
              <Text className="font-black uppercase text-[8px] tracking-widest">
                {(suggestedMatch.confidence * 100).toFixed(0)}% Match
              </Text>
            </View>
            <button 
              onClick={() => setIsEditing(true)}
              className="text-muted-foreground hover:text-primary text-[8px] font-bold uppercase tracking-widest underline transition-colors"
            >
              Change
            </button>
          </View>
        )}
      </View>

      {isEditing ? (
        <View className="gap-3">
          <View className="relative">
            <Search size={14} className="absolute left-3 top-3 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search catalog..."
              className="pl-10 h-10 bg-muted/40 border-border text-xs"
            />
          </View>
          
          <View className="flex-row gap-2">
            <Button
              onClick={() => setIsEditing(false)}
              variant="outline"
              className="flex-1 h-10 border-border hover:bg-muted"
            >
              <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest">
                Cancel
              </Text>
            </Button>
            
            {onCreateNew && (
              <Button
                onClick={() => onCreateNew(searchTerm)}
                className="flex-1 h-10 bg-primary/10 border border-primary/20 hover:bg-primary/20"
              >
                <View className="flex-row items-center gap-2">
                  <Plus size={12} className="text-primary" />
                  <Text className="text-primary font-bold uppercase text-[10px] tracking-widest">
                    Create New
                  </Text>
                </View>
              </Button>
            )}
          </View>
        </View>
      ) : (
        <View className="bg-muted/40 border border-primary/20 p-3 rounded-xl flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="w-8 h-8 rounded-lg bg-primary/10 items-center justify-center">
              <Check size={16} className="text-primary" />
            </View>
            <Text className="text-foreground font-bold text-sm uppercase">
              {suggestedMatch?.name}
            </Text>
          </View>
          <View className="px-2 py-1 rounded bg-primary/10 border border-primary/20">
             <Text className="text-primary font-mono text-[8px] uppercase tracking-widest">Linked</Text>
          </View>
        </View>
      )}
    </View>
  );
}
