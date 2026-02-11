"use client";

import React, { useEffect, useState } from "react";
import { View, Text, Logo, KioskLoading } from "@sous/ui";
import { PresentationRenderer, DevicePairingFlow } from "@sous/features";
import { useSearchParams } from "next/navigation";

export const SignageView = ({ id }: { id: string }) => {
  const searchParams = useSearchParams();
  const displayId = searchParams.get("displayId") || "primary";
  
  const [presentation, setPresentation] = useState<{
    structure: any;
    content: any;
  } | null>(null);

  return (
    <DevicePairingFlow type="signage">
      {({ socket }) => (
        <SignageContent 
          socket={socket} 
          presentation={presentation} 
          setPresentation={setPresentation} 
        />
      )}
    </DevicePairingFlow>
  );
};

const SignageContent = ({ socket, presentation, setPresentation }: any) => {
  useEffect(() => {
    if (!socket) return;

    // Request current state on connect
    socket.emit("presentation:request_sync");

    socket.on("presentation:update", (data: any) => {
      console.log("📺 Presentation updated:", data);
      setPresentation(data);
    });

    return () => {
      socket.off("presentation:update");
    };
  }, [socket, setPresentation]);

  if (!presentation) {
    return (
      <View className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Logo size={48} animate suffix="signage" className="mb-12 opacity-20" />
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
