import React from "react";
import { View, Logo } from "@sous/ui";

export default function Loading() {
  return (
    <View className="flex-1 items-center justify-center bg-background min-h-screen">
      <Logo size={48} animate variant="whisk" />
    </View>
  );
}
