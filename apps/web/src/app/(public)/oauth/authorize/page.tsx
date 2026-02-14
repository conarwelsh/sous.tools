"use client";

import React, { Suspense } from "react";
import { ConsentView } from "@sous/features";
import { View, Logo } from "@sous/ui";

export default function OAuthAuthorizePage() {
  return (
    <View className="min-h-screen bg-background flex items-center justify-center p-6">
      <Suspense fallback={<Logo size={60} animate />}>
        <ConsentView />
      </Suspense>
    </View>
  );
}
