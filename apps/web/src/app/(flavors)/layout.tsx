import React from "react";
import { View } from "@sous/ui";

export default function KioskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <View className="bg-black min-h-screen w-full overflow-hidden">
      {children}
    </View>
  );
}
