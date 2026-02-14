"use client";

import React from "react";
import { View, Text, Card } from "@sous/ui";
import { Book, History } from "lucide-react";

export default function LedgerPage() {
  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Finances / Historical Record
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            General Ledger
          </Text>
        </View>
      </View>

      <Card className="p-8 bg-card border-border items-center justify-center border-dashed min-h-[400px]">
        <Book size={48} className="text-muted-foreground/20 mb-4" />
        <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
          Ledger is Empty
        </Text>
        <Text className="text-muted-foreground/60 text-sm max-w-xs text-center">
          Finalized operational events from POS and Procurement will build your
          source-of-truth record.
        </Text>
      </Card>
    </View>
  );
}
