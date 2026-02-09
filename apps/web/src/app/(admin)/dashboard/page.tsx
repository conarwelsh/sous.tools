"use client";

import React from "react";
import { useAuth } from "@sous/features";
import { View, Text, Button, Card } from "@sous/ui";

import {
  LayoutGrid,
  Users,
  FileText,
  Settings,
  Activity,
  HardDrive,
  Utensils,
  Box,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      label: "Active Recipes",
      value: "42",
      icon: Utensils,
      color: "text-emerald-500",
    },
    {
      label: "Inventory Items",
      value: "128",
      icon: Box,
      color: "text-sky-500",
    },
    {
      label: "Pending Invoices",
      value: "5",
      icon: FileText,
      color: "text-amber-500",
    },
    {
      label: "Connected Nodes",
      value: "3",
      icon: HardDrive,
      color: "text-purple-500",
    },
  ];

  return (
    <main className="flex-1 bg-[#0a0a0a] p-8 min-h-screen">
      <View className="mb-12 flex flex-row justify-between items-end">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2 block">
            Control Center
          </Text>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Dashboard
          </h1>
        </View>
        <View className="flex flex-col items-end">
          <Text className="text-zinc-400 font-bold">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-zinc-600 text-xs font-mono uppercase">
            {user?.role}
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((s, i) => (
          <Card
            key={i}
            className="p-6 bg-zinc-900 border-zinc-800"
          >
            <View className="flex flex-row justify-between items-start mb-4">
              <View className="p-3 bg-zinc-800 rounded-xl">
                <s.icon size={20} className={s.color} />
              </View>
              <Text className="text-zinc-700 font-mono text-[10px]">LIVE</Text>
            </View>
            <Text className="text-3xl font-black text-white block">
              {s.value}
            </Text>
            <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mt-1 block">
              {s.label}
            </Text>
          </Card>
        ))}
      </View>

      <View className="flex flex-row gap-8">
        {/* Main Content Area */}
        <View className="flex-[2] flex flex-col gap-8">
          <Card className="p-8 bg-zinc-900 border-zinc-800 h-96 flex flex-col items-center justify-center border-dashed">
            <Activity size={48} className="text-zinc-800 mb-4" />
            <Text className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
              System Activity Feed (Coming Soon)
            </Text>
          </Card>
        </View>

        {/* Sidebar Panel */}
        <View className="flex-1 flex flex-col gap-8">
          <Card className="p-6 bg-zinc-900 border-zinc-800">
            <Text className="text-white font-bold uppercase text-xs tracking-widest mb-6 block">
              Quick Actions
            </Text>
            <View className="flex flex-col gap-3">
              {["Scan Invoice", "Add Recipe", "New Inventory Count"].map(
                (action) => (
                  <Button
                    key={action}
                    className="p-4 bg-zinc-800 rounded-xl border border-zinc-700/50 hover:bg-zinc-700 transition-colors text-left"
                  >
                    <Text className="text-zinc-300 font-bold text-sm uppercase tracking-tight">
                      {action}
                    </Text>
                  </Button>
                ),
              )}
            </View>
          </Card>
        </View>
      </View>
    </main>
  );
}