"use client";

import React from "react";
import { Card, CardContent, Text, View } from "@sous/ui";
import { LucideIcon } from "lucide-react";
import { cn } from "@sous/ui";

interface SupportCategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

export const SupportCategoryCard: React.FC<SupportCategoryCardProps> = ({
  title,
  description,
  icon: Icon,
  selected,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        "cursor-pointer transition-all hover:border-primary/50",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border",
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <View className="flex flex-col items-center text-center space-y-4">
          <View
            className={cn(
              "p-3 rounded-full",
              selected
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            <Icon size={24} />
          </View>
          <View className="space-y-1">
            <Text className="text-lg font-semibold">{title}</Text>
            <Text className="text-sm text-muted-foreground">{description}</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
};
