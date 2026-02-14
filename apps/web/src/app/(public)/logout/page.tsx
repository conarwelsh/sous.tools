"use client";

import React, { useEffect } from "react";
import { useAuth } from "@sous/features";
import { View, Text } from "@sous/ui";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    logout().then(() => {
      router.push("/");
    });
  }, [logout, router]);

  return (
    <View className="flex-1 bg-[#0a0a0a] justify-center items-center">
      <Text className="text-zinc-500 font-mono animate-pulse uppercase tracking-[0.3em]">
        Terminating Session...
      </Text>
    </View>
  );
}
