"use client";

import React, { useEffect, useState, useMemo } from "react";
import { View, Text, Logo, KioskLoading } from "@sous/ui";
import { PresentationRenderer, DevicePairingFlow } from "@sous/features";
import { getHttpClient } from "@sous/client-sdk";
import { useQuery, useSubscription } from "@apollo/client/react";
import { GET_ACTIVE_LAYOUT, PRESENTATION_UPDATED_SUBSCRIPTION } from "@/lib/graphql";
import { X } from "lucide-react";

export const SignageView = ({ id }: { id: string }) => {
  const [publicPresentation, setPublicPresentation] = useState<any>(null);
  const [isPublicLoading, setIsPublicLoading] = useState(true);

  useEffect(() => {
    const fetchPublicScreen = async () => {
      const hostname = window.location.hostname;
      const parts = hostname.split(".");
      let orgSlug: string | undefined;

      if (
        parts.length >= 3 &&
        parts[0] !== "web" &&
        parts[0] !== "api" &&
        parts[0] !== "docs"
      ) {
        orgSlug = parts[0];
      }

      if (!orgSlug && !id) {
        setIsPublicLoading(false);
        return;
      }

      try {
        const http = await getHttpClient();
        const config: any = {
          headers: orgSlug ? { "x-org-slug": orgSlug } : {},
        };

        const data = await http.get<any>(
          `/public/presentation/signage/${id}`,
          config,
        );
        setPublicPresentation(data);
      } catch (e) {
        console.log(
          "Public screen fetch failed, falling back to pairing mode.",
        );
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

  if (isPublicLoading) {
    return <KioskLoading suffix="signage" />;
  }

  return (
    <DevicePairingFlow type="signage">
      {({ hardwareId }) => <SignageContent hardwareId={hardwareId} />}
    </DevicePairingFlow>
  );
};

const SignageContent = ({ hardwareId }: { hardwareId: string }) => {
  const [presentation, setPresentation] = useState<any>(null);

  // Helper to safely parse layout data
  const parseLayout = (layout: any) => {
    if (!layout) return null;
    return {
      ...layout,
      structure: typeof layout.structure === 'string' ? JSON.parse(layout.structure) : layout.structure,
      content: typeof layout.content === 'string' ? JSON.parse(layout.content) : layout.content,
      config: typeof layout.config === 'string' ? JSON.parse(layout.config) : layout.config,
    };
  };

  // 1. Initial Fetch
  const { data, loading: queryLoading, error: queryError } = useQuery(GET_ACTIVE_LAYOUT, {
    variables: { hardwareId },
    fetchPolicy: 'network-only' // Ensure we get latest data
  });

  // 2. Real-time Subscription
  const { data: subData } = useSubscription(PRESENTATION_UPDATED_SUBSCRIPTION, {
    variables: { hardwareId },
  });

  // Handle Query Data
  useEffect(() => {
    if (data?.activeLayout) {
      setPresentation(parseLayout(data.activeLayout));
    }
  }, [data]);

  // Handle Subscription Data
  useEffect(() => {
    if (subData?.presentationUpdated) {
      setPresentation(parseLayout(subData.presentationUpdated));
    }
  }, [subData]);

  if (queryError) {
    return (
      <View className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <X size={48} className="text-red-500 mb-4" />
        <Text className="text-red-500 font-bold uppercase tracking-widest">
          Query Error: {queryError.message}
        </Text>
      </View>
    );
  }

  if (queryLoading && !presentation) {
    return (
      <View className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Logo size={48} animate suffix="signage" className="mb-12 opacity-20" />
        <Text className="text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
          Fetching Layout...
        </Text>
      </View>
    );
  }

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
      customCss={presentation.config?.customCss || (presentation as any).customCss}
    />
  );
};
