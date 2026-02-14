import React, { Suspense } from "react";
import { WastageView } from "@sous/features";
import { View } from "@sous/ui";
import { Loader2 } from "lucide-react";

export default function WastagePage() {
  return (
    <Suspense
      fallback={
        <View className="flex-1 items-center justify-center">
          <Loader2 className="animate-spin text-primary" />
        </View>
      }
    >
      <WastageView />
    </Suspense>
  );
}
