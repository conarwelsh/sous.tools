"use client";

import React from "react";
import { View, Text, Button, Card } from "@sous/ui";
import { Package, Plus } from "lucide-react";

export function StockLedgerView() {
  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Inventory / Stock Control
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Stock Ledger
          </Text>
        </View>
        <Button className="bg-sky-500 hover:bg-sky-600 px-6 h-12">
          <View className="flex-row items-center gap-2">
            <Plus size={18} color="white" />
            <Text className="text-white font-bold uppercase text-xs tracking-widest">
              New Count
            </Text>
          </View>
        </Button>
      </View>

      <Card className="p-8 bg-card border-border items-center justify-center border-dashed min-h-[400px]">
        <Package size={48} className="text-muted-foreground/20 mb-4" />
        <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
          Stock Levels Unknown
        </Text>
        <Text className="text-muted-foreground/60 text-sm max-w-xs text-center">
          Perform your first physical count to calibrate the virtual inventory
          engine.
        </Text>
      </Card>
    </View>
  );
}
