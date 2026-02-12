"use client";

import React from "react";
import { View, Text, Button, Card } from "@sous/ui";
import { Gauge, Calculator } from "lucide-react";

export default function CostingPage() {
  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Finances / Analytics
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Recipe Costing
          </Text>
        </View>
        <Button className="bg-primary hover:bg-primary/90 px-6 h-12">
          <View className="flex-row items-center gap-2">
            <Calculator size={18} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
              Recalculate All
            </Text>
          </View>
        </Button>
      </View>

      <Card className="p-8 bg-card border-border items-center justify-center border-dashed min-h-[400px]">
        <Gauge size={48} className="text-muted-foreground/20 mb-4" />
        <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
          No Costing Data
        </Text>
        <Text className="text-muted-foreground/60 text-sm max-w-xs text-center">
          Real-time costing snapshots require processed invoices and defined
          recipes.
        </Text>
      </Card>
    </View>
  );
}