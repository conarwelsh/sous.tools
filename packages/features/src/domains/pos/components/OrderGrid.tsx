import React from "react";
import { Card, View, Text, ScrollView } from "@sous/ui";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  color?: string;
}

interface Props {
  items: MenuItem[];
  onItemPress: (item: MenuItem) => void;
}

export const OrderGrid = ({ items, onItemPress }: Props) => {
  return (
    <ScrollView className="flex-1 p-4">
      <div className="flex flex-row flex-wrap gap-4 justify-center md:justify-start">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemPress(item)}
            className="w-[150px] h-[120px] transition-transform active:scale-95 group"
          >
            <Card className="h-full flex flex-col items-center justify-center p-4 bg-zinc-900 border-zinc-800 group-hover:border-primary transition-all">
              <span className="text-lg font-bold text-center text-white uppercase tracking-tight leading-none mb-2">
                {item.name}
              </span>
              <span className="text-muted-foreground font-mono text-sm">
                ${(item.price / 100).toFixed(2)}
              </span>
            </Card>
          </button>
        ))}
      </div>
    </ScrollView>
  );
};
