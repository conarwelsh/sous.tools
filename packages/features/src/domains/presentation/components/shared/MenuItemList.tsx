"use client";

import React from "react";
import { View, Text, cn } from "@sous/ui";

export interface MenuItemListProps {
  items: any[];
  columns?: number;
  showDescription?: boolean;
  showPrice?: boolean;
}

export function MenuItemList({
  items = [],
  columns = 2,
  showDescription = true,
  showPrice = true,
}: MenuItemListProps) {
  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8 opacity-20">
        <Text className="text-foreground font-black uppercase text-xs tracking-widest">No Items Selected</Text>
      </View>
    );
  }

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  }[columns as 1 | 2 | 3 | 4] || "grid-cols-2";

  return (
    <div className={cn("grid gap-8 p-8 w-full", gridColsClass)}>
      {items.map((item) => (
        <View key={item.id} className="gap-2">
          <View className="flex-row justify-between items-start gap-4">
            <Text className="text-xl font-black text-foreground uppercase tracking-tight leading-none flex-1">
              {item.name}
            </Text>
            {showPrice && (
              <Text className="text-lg font-mono font-bold text-primary">
                ${(item.price / 100).toFixed(2)}
              </Text>
            )}
          </View>
          {showDescription && item.description && (
            <Text className="text-xs text-muted-foreground font-medium leading-relaxed max-w-prose">
              {item.description}
            </Text>
          )}
        </View>
      ))}
    </div>
  );
}
