import React from "react";
import { AuthProvider } from "@sous/features";
import { View } from "@sous/ui";

export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <View className="flex-1 bg-[#0a0a0a] min-h-screen">
      {children}
      {modal}
    </View>
  );
}
