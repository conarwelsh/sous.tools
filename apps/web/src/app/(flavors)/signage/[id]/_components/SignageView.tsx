"use client";

import React, { useEffect, useState } from "react";
import { View, Text, Logo, KioskLoading } from "@sous/ui";
import { PresentationRenderer, DevicePairingFlow } from "@sous/features";
import { useSearchParams } from "next/navigation";
import { getHttpClient } from "@sous/client-sdk";

export const SignageView = ({ id }: { id: string }) => {
  const [publicPresentation, setPublicPresentation] = useState<any>(null);
  const [isPublicLoading, setIsPublicLoading] = useState(true);

  useEffect(() => {
    const fetchPublicScreen = async () => {
      // 1. Detect subdomain
      const hostname = window.location.hostname;
      const parts = hostname.split('.');
      let orgSlug: string | undefined;
      
      // Handle local and production subdomains
      if (parts.length >= 3 && parts[0] !== 'web' && parts[0] !== 'api' && parts[0] !== 'docs') {
        orgSlug = parts[0];
      }

      if (!orgSlug && !id) {
        setIsPublicLoading(false);
        return;
      }

      try {
        const http = await getHttpClient();
        // Pass org slug in header for verification
        const config: any = {
          headers: orgSlug ? { 'x-org-slug': orgSlug } : {}
        };
        
        const data = await http.get<any>(`/public/presentation/signage/${id}`, config);
        setPublicPresentation(data);
      } catch (e) {
        // Fallback to pairing if public fetch fails
        console.log("Public screen fetch failed, falling back to pairing mode.");
      } finally {
        setIsPublicLoading(false);
      }
    };

    fetchPublicScreen();
  }, [id]);

  if (publicPresentation) {
    return (
      <PresentationRenderer
        structure={publicPresentation.structure}
        slots={publicPresentation.content}
        customCss={publicPresentation.customCss}
      />
    );
  }

  // Only show pairing flow if public fetch is done and found nothing
  if (isPublicLoading) {
    return <KioskLoading suffix="signage" />;
  }

  return (
    <DevicePairingFlow type="signage">
      {({ socket }) => (
        <SignageContent 
          socket={socket} 
        />
      )}
    </DevicePairingFlow>
  );
};

const SignageContent = ({ socket }: any) => {
  const [presentation, setPresentation] = useState<{
    structure: any;
    content: any;
  } | null>(null);

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
  }, [socket]);

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
      slots={presentation.content}
      customCss={(presentation as any).customCss}
    />
  );
};
