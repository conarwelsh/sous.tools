"use client";

import React from "react";
import { InvitationManager, TeamList } from "@sous/features";
import { View, Text } from "@sous/ui";
import { Users } from "lucide-react";

export default function TeamSettingsPage() {
  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row items-center gap-4 mb-12">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl shadow-primary/20">
          <Users size={24} className="text-primary-foreground" />
        </div>
        <View>
          <Text className="text-muted-foreground font-black uppercase text-[10px] tracking-[0.3em] mb-1">
            Organization / Access Control
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Team Management
          </Text>
        </View>
      </View>

      <div className="max-w-4xl space-y-12">
        <TeamList />
        <InvitationManager />
      </div>
    </View>
  );
}
