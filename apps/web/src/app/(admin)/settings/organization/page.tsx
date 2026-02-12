"use client";

import React from "react";
import { View, Text, Button, Card, Logo } from "@sous/ui";
import { Building2, Save } from "lucide-react";
import { useAuth } from "@sous/features";

export default function OrganizationSettingsPage() {
  const { user } = useAuth();

  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Settings / Governance
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            Organization
          </Text>
        </View>
        <Button className="bg-primary hover:bg-primary/90 px-6 h-12">
          <View className="flex-row items-center gap-2">
            <Save size={18} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
              Save Changes
            </Text>
          </View>
        </Button>
      </View>

      <View className="gap-8 max-w-4xl">
        <Card className="p-8 bg-card border-border">
          <View className="flex-row items-center gap-4 mb-8">
            <View className="p-3 bg-muted rounded-xl">
              <Building2 size={24} className="text-primary" />
            </View>
            <View>
              <Text className="text-foreground font-bold uppercase text-lg tracking-tight">
                General Information
              </Text>
              <Text className="text-muted-foreground text-xs uppercase tracking-widest">
                Public identity and branding
              </Text>
            </View>
          </View>

          <View className="gap-6">
            <View>
              <Text className="text-muted-foreground/60 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">
                Organization Name
              </Text>
              <View className="h-12 bg-muted/20 border border-border rounded-xl px-4 justify-center">
                <Text className="text-foreground/80">
                  {(user as any)?.organization?.name || "Loading..."}
                </Text>
              </View>
            </View>

            <View>
              <Text className="text-muted-foreground/60 font-bold uppercase text-[10px] tracking-widest mb-2 ml-1">
                Logo Variant
              </Text>
              <View className="flex-row gap-4">
                <Logo variant="neon" size={32} showWordmark={false} />
                <Logo variant="circuit" size={32} showWordmark={false} />
                <Logo variant="plate" size={32} showWordmark={false} />
              </View>
            </View>
          </View>
        </Card>
      </View>
    </View>
  );
}