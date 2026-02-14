"use client";

import React from "react";
import { SalesDashboard, useAuth } from "@sous/features";
import { View, Text, Logo } from "@sous/ui";
import { notFound } from "next/navigation";

export default function SalesPortalPage() {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <View className="flex-1 bg-background flex justify-center items-center h-screen">
        <Logo variant="cloud" size={48} suffix="tools" animate />
      </View>
    );

  if (user?.role !== "salesman" && user?.role !== "superadmin") {
    return notFound();
  }

  return (
    <View className="flex-1 p-6 md:p-12 max-w-6xl mx-auto space-y-12">
      <View className="space-y-4">
        <Text className="text-4xl font-black italic uppercase tracking-tighter">
          Salesman Portal
        </Text>
        <Text className="text-muted-foreground">
          Track your attributed kitchens and commissions.
        </Text>
      </View>

      <SalesDashboard />
    </View>
  );
}
