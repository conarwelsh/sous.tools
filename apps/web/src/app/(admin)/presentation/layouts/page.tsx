"use client";

import React, { Suspense } from "react";
import { LayoutManager } from "@sous/features";
import { Loader2 } from "lucide-react";
import { View } from "@sous/ui";

function LayoutsContent() {
  return <LayoutManager />;
}

export default function LayoutsPage() {
  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={48} />
        </View>
      }
    >
      <LayoutsContent />
    </Suspense>
  );
}
