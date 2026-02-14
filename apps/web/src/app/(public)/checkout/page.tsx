"use client";

import React from "react";
import { CheckoutView } from "@sous/features";
import { View } from "@sous/ui";

export default function CheckoutPage() {
  return (
    <View className="min-h-screen bg-background flex items-center justify-center p-6 md:p-12">
      <CheckoutView />
    </View>
  );
}
