"use client";

import React from "react";
import {
  View,
  Text,
  Button,
  Input,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  ScrollView,
  Checkbox,
} from "@sous/ui";
import {
  Settings,
  Layout as LayoutIcon,
  MonitorPlay,
} from "lucide-react";
import { TagManager } from "../../../../core/tags/components/TagManager";
import { cn } from "@sous/ui";
import { Layout } from "../../../types/presentation.types";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  layout: Partial<Layout>;
  setLayout: React.Dispatch<React.SetStateAction<Partial<Layout>>>;
  displays: any[];
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  layout,
  setLayout,
  displays,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-foreground font-black uppercase tracking-widest text-xs flex flex-row items-center gap-3">
            <Settings size={16} className="text-sky-500" />
            Presentation Configuration
          </DialogTitle>
        </DialogHeader>
        <ScrollView className="max-h-[70vh]">
          <View className="gap-8 py-4 px-1">
            <View className="gap-2">
              <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest leading-none mb-1">
                Friendly Name
              </Text>
              <Input
                value={layout.name}
                onChange={(e) =>
                  setLayout((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                className="h-12 bg-muted/20 border-border text-sm font-bold uppercase"
              />
            </View>

            <View className="gap-2">
              <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest leading-none mb-1">
                Entity Type
              </Text>
              <div className="grid grid-cols-2 gap-2">
                {["TEMPLATE", "SCREEN", "LABEL", "PAGE"].map((t) => (
                  <Button
                    key={t}
                    onClick={() =>
                      setLayout((prev) => ({
                        ...prev,
                        type: t as any,
                      }))
                    }
                    variant="outline"
                    className={cn(
                      "h-12 border-border gap-2",
                      layout.type === t &&
                        "border-sky-500 bg-sky-500/5 ring-1 ring-sky-500/50 shadow-[0_0_15px_rgba(14,165,233,0.1)]",
                    )}
                  >
                    <LayoutIcon
                      size={14}
                      className={
                        layout.type === t
                          ? "text-sky-500"
                          : "text-muted-foreground"
                      }
                    />
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        layout.type === t
                          ? "text-foreground"
                          : "text-muted-foreground",
                      )}
                    >
                      {t}
                    </span>
                  </Button>
                ))}
              </div>
            </View>

            {layout.type === "SCREEN" && (
              <View className="gap-4 border-t border-border pt-8 mt-2">
                <Text className="text-sky-500 font-black uppercase text-[10px] tracking-widest">
                  Hardware Deployment
                </Text>
                <View className="gap-2">
                  <Text className="text-muted-foreground font-bold uppercase text-[8px] tracking-widest leading-none mb-1">
                    Assigned Displays
                  </Text>
                  <ScrollView className="max-h-40 border border-border rounded-2xl bg-muted/10 p-2">
                    {displays.length > 0 ? (
                      displays.map((d) => {
                        const isAssigned = (
                          layout.config?.hardware || []
                        ).includes(d.id);
                        return (
                          <div
                            key={d.id}
                            onClick={() => {
                              const current =
                                layout.config?.hardware || [];
                              const next = isAssigned
                                ? current.filter((id) => id !== d.id)
                                : [...current, d.id];
                              setLayout((prev) => ({
                                ...prev,
                                config: {
                                  ...prev.config,
                                  hardware: next,
                                },
                              }));
                            }}
                            className="flex flex-row items-center gap-3 p-3 hover:bg-sky-500/10 rounded-xl cursor-pointer transition-colors"
                          >
                            <Checkbox checked={isAssigned} />
                            <View>
                              <Text
                                className={cn(
                                  "text-[10px] font-black uppercase",
                                  isAssigned
                                    ? "text-sky-500"
                                    : "text-foreground/70",
                                )}
                              >
                                {d.name}
                              </Text>
                              <Text className="text-[8px] text-muted-foreground font-mono">
                                {d.id.slice(0, 8)} |{" "}
                                {d.metadata?.resolution || "Auto"}
                              </Text>
                            </View>
                          </div>
                        );
                      })
                    ) : (
                      <View className="p-8 items-center">
                        <MonitorPlay
                          size={24}
                          className="text-muted-foreground/30 mb-2"
                        />
                        <Text className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">
                          No Displays Found
                        </Text>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            )}

            <View className="gap-2 border-t border-border pt-8 mt-2">
              <Text className="text-muted-foreground font-black uppercase text-[8px] tracking-widest leading-none mb-1">
                Classification Tags
              </Text>
              <TagManager
                entityType="layout"
                entityId={layout.id!}
              />
            </View>
          </View>
        </ScrollView>
        <div className="flex flex-row justify-end mt-6">
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-sky-500 h-12 px-8 rounded-2xl shadow-xl shadow-sky-500/20"
          >
            <span className="text-white font-black uppercase tracking-widest text-[10px]">
              Complete Settings
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
