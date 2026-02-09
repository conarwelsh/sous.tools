"use client";

import React from "react";
import { View, Text, Button, Card } from "@sous/ui";
import { User, Save } from "lucide-react";
import { useAuth } from "@sous/features";

export default function PersonalSettingsPage() {
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-[#0a0a0a] p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            Settings / Profile
          </Text>
          <Text className="text-4xl font-black text-white uppercase tracking-tighter">
            Personal
          </Text>
        </View>
        <Button className="bg-sky-500 px-6 h-12">
          <View className="flex-row items-center gap-2">
            <Save size={18} color="white" />
            <Text className="text-white font-bold uppercase text-xs tracking-widest">
              Save Profile
            </Text>
          </View>
        </Button>
      </View>

      <View className="gap-8 max-w-4xl">
        <Card className="p-8 bg-zinc-900 border-zinc-800">
          <View className="flex-row items-center gap-4 mb-8">
            <View className="p-3 bg-zinc-800 rounded-xl">
              <User size={24} className="text-emerald-500" />
            </View>
            <View>
              <Text className="text-white font-bold uppercase text-lg tracking-tight">
                User Profile
              </Text>
              <Text className="text-zinc-500 text-xs uppercase tracking-widest">
                Your account preferences
              </Text>
            </View>
          </View>

          <View className="flex-row gap-6">
            <View className="flex-1">
              <Text className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">
                First Name
              </Text>
              <View className="h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 justify-center">
                <Text className="text-zinc-300">
                  {user?.firstName || "Loading..."}
                </Text>
              </View>
            </View>
            <View className="flex-1">
              <Text className="text-zinc-600 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">
                Last Name
              </Text>
              <View className="h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 justify-center">
                <Text className="text-zinc-300">
                  {user?.lastName || "Loading..."}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}