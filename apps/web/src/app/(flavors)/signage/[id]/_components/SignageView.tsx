"use client";

import React, { useEffect, useState } from "react";
import { View, Text, Logo, KioskLoading } from "@sous/ui";
import { PresentationRenderer, useHardware } from "@sous/features";
import { useSearchParams } from "next/navigation";

export const SignageView = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const displayId = searchParams.get("displayId") || "primary";
  
  // Pass the unique displayId to the hardware hook so it can be registered
  const { isPaired, pairingCode, isLoading, socket } = useHardware(`signage:${displayId}`);
  const [presentation, setPresentation] = useState<{
    structure: any;
    content: any;
  } | null>(null);

  useEffect(() => {
    if (!socket) return;

    socket.on("presentation:update", (data: any) => {
      console.log("📺 Presentation updated:", data);
      setPresentation(data);
    });

    return () => {
      socket.off("presentation:update");
    };
  }, [socket]);

  if (isLoading) {
    return <KioskLoading suffix="signage" />;
  }

  if (!isPaired) {
    return (
      <View className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Logo variant="neon" size={64} animate suffix="signage" className="mb-12" />
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Pair Digital Screen
        </h1>
        <p className="text-zinc-500 max-w-md mb-12">
          This display is not yet paired. Enter the code below in your manager
          dashboard under Hardware.
        </p>

        <View className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 shadow-2xl">
          <Text className="text-7xl font-mono font-black text-sky-500 tracking-[0.2em] ml-[0.2em]">
            {pairingCode || "------"}
          </Text>
        </View>
      </View>
    );
  }

  if (!presentation) {
    return (
      <View className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Logo variant="neon" size={48} animate suffix="signage" className="mb-12 opacity-20" />
        <Text className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
          Awaiting Content...
        </Text>
      </View>
    );
  }

  return (
    <PresentationRenderer
      structure={presentation.structure}
      content={presentation.content}
    />
  );
};
