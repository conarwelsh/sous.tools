"use client";

import React from "react";
import { View, Text, cn } from "@sous/ui";
import { useRouter, usePathname } from "next/navigation";
import {
  Settings as SettingsIcon,
  Link as LinkIcon,
  Cpu,
  User,
  Building2,
} from "lucide-react";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { label: "Organization", href: "/settings/organization", icon: Building2 },
    { label: "Personal", href: "/settings/personal", icon: User },
    { label: "Integrations", href: "/settings/integrations", icon: LinkIcon },
    { label: "Hardware", href: "/settings/hardware", icon: Cpu },
  ];

  return (
    <View className="flex-1 bg-background flex flex-col h-screen overflow-hidden">
      {/* Settings Appbar */}
      <View className="bg-card border-b border-border px-8 pt-8 shrink-0">
        <View className="mb-6">
          <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-[0.2em] mb-1">
            System / Configuration
          </Text>
          <Text className="text-3xl font-black text-foreground uppercase tracking-tighter">
            Settings Center
          </Text>
        </View>

        <View className="flex-row gap-8">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <button
                key={tab.href}
                onClick={() => router.push(tab.href)}
                className={cn(
                  "flex-row items-center gap-2 pb-4 border-b-2 transition-all group",
                  isActive
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                <tab.icon
                  size={14}
                  className={cn(
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <Text className="text-[10px] font-black uppercase tracking-widest">
                  {tab.label}
                </Text>
              </button>
            );
          })}
        </View>
      </View>

      {/* Page Content */}
      <View className="flex-1 overflow-auto bg-muted/5">{children}</View>
    </View>
  );
}
