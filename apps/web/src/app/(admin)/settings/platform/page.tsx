"use client";

import React from "react";
import { PlatformSettingsView, useAuth } from "@sous/features";
import { View, Text, Logo } from "@sous/ui";
import { notFound } from "next/navigation";

export default function PlatformSettingsPage() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <View className="flex-1 bg-background flex justify-center items-center h-screen">
        <Logo variant="cloud" size={48} suffix="tools" animate />
      </View>
    );

  if (user?.role !== "superadmin") {
    return notFound();
  }

  return (
    <View className="flex-1 p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <View className="space-y-4">
        <Text className="text-4xl font-black italic uppercase tracking-tighter">
          Platform Settings
        </Text>
        <Text className="text-muted-foreground">
          Global configuration for the entire Sous OS ecosystem.
        </Text>
      </View>

      <PlatformSettingsView />
    </View>
  );
}
