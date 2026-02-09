"use client";

import React from "react";
import { View, Text, Button, Card } from "@sous/ui";
import { StickyNote, Plus } from "lucide-react";

export default function LabelsPage() {
  return (
    <View className="flex-1 bg-[#0a0a0a] p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            Presentation / Operational Output
          </Text>
          <Text className="text-4xl font-black text-white uppercase tracking-tighter">
            Thermal Labels
          </Text>
        </View>
        <Button className="bg-sky-500 px-6 h-12">
          <View className="flex-row items-center gap-2">
            <Plus size={18} color="white" />
            <Text className="text-white font-bold uppercase text-xs tracking-widest">
              Design Label
            </Text>
          </View>
        </Button>
      </View>

      <Card className="p-8 bg-zinc-900 border-zinc-800 items-center justify-center border-dashed min-h-[400px]">
        <StickyNote size={48} className="text-zinc-800 mb-4" />
        <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
          No Label Designs
        </Text>
        <Text className="text-zinc-700 text-sm max-w-xs text-center">
          Create prep and shelf labels with dynamic data binding for expiration
          dates and barcodes.
        </Text>
      </Card>
    </View>
  );
}