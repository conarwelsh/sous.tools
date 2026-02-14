"use client";

import React, { useState, useEffect, useMemo } from "react";
import { View, Text } from "@sous/ui";
import { Loader2 } from "lucide-react";
import { getHttpClient } from "@sous/client-sdk";
import { TemplateSkeletonRenderer } from "./shared/TemplateSkeletonRenderer";
import { MenuItemList } from "./shared/MenuItemList";
import { LayoutNode, SlotAssignment } from "../types/presentation.types";

interface Props {
  structure: LayoutNode;
  slots: Record<string, SlotAssignment>;
  customCss?: string;
}

export const PresentationRenderer: React.FC<Props> = ({
  structure,
  slots,
  customCss,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRequiredData = async () => {
      const hasPosSlots = Object.values(slots).some(
        (s) => s.sourceType === "POS",
      );
      if (!hasPosSlots) return;

      setIsLoading(true);
      try {
        const http = await getHttpClient();
        // In a real public view, we might need a public endpoint for products
        // for now we assume the client has access or we use the authenticated one
        const data = await http.get<any[]>("/culinary/products");
        setProducts(data);
      } catch (e) {
        console.error("Failed to fetch products for presentation", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequiredData();
  }, [slots]);

  const contentMap = useMemo(() => {
    return Object.entries(slots).reduce(
      (acc, [id, slot]) => {
        if (slot.sourceType === "POS") {
          const filtered = products.filter((p) => {
            if (slot.dataConfig.filters?.itemIds?.length) {
              return slot.dataConfig.filters.itemIds.includes(p.id);
            }
            if (slot.dataConfig.filters?.categoryId) {
              return p.categoryId === slot.dataConfig.filters.categoryId;
            }
            return false;
          });

          acc[id] = (
            <MenuItemList items={filtered} {...(slot.componentProps || {})} />
          );
        } else if (slot.sourceType === "MEDIA" && slot.dataConfig.mediaId) {
          acc[id] = (
            <View className="flex-1 overflow-hidden">
              {/* In a real app, we'd fetch the media URL here */}
              <View className="flex-1 bg-muted/20 items-center justify-center">
                <Text className="text-[8px] font-black uppercase text-muted-foreground/50">
                  Media: {slot.dataConfig.mediaId.substring(0, 8)}
                </Text>
              </View>
            </View>
          );
        } else if (slot.sourceType === "STATIC") {
          acc[id] = (
            <View className="flex-1 p-8">
              <Text className="text-white text-2xl font-bold">
                {slot.dataConfig.staticData?.title ||
                  slot.dataConfig.staticData?.text ||
                  JSON.stringify(slot.dataConfig.staticData)}
              </Text>
            </View>
          );
        }
        return acc;
      },
      {} as Record<string, React.ReactNode>,
    );
  }, [slots, products]);

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background overflow-hidden relative">
      {customCss && <style dangerouslySetInnerHTML={{ __html: customCss }} />}
      <TemplateSkeletonRenderer
        node={structure}
        contentMap={contentMap}
        isEditMode={false}
      />
    </View>
  );
};
