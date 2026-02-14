"use client";

import React, { useState } from "react";
import { View, Text, Card, Button, ScrollView, Logo } from "@sous/ui";
import { useAuth } from "../../iam/auth/hooks/useAuth";
import { useRouter } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery, useSubscription } from "@apollo/client/react";
import {
  Monitor,
  Smartphone,
  Watch,
  Terminal,
  Cpu,
  Wifi,
  Activity,
  Settings as SettingsIcon,
  Trash2,
} from "lucide-react";

const GET_DEVICES = gql`
  query GetDevices($orgId: String!) {
    devices(orgId: $orgId) {
      id
      name
      type
      status
      hardwareId
      metadata
      lastHeartbeat
      organizationId
    }
  }
`;

const DEVICE_UPDATED_SUBSCRIPTION = gql`
  subscription OnDeviceUpdated($orgId: String!) {
    deviceUpdated(orgId: $orgId) {
      id
      name
      type
      status
      hardwareId
      metadata
      lastHeartbeat
      organizationId
    }
  }
`;

export const HardwareManager = () => {
  const { user } = useAuth();
  const router = useRouter();

  const orgId = user?.organizationId || "";

  const { data, loading, error, refetch } = useQuery<any>(GET_DEVICES, {
    variables: { orgId },
    skip: !orgId,
  });

  useSubscription(DEVICE_UPDATED_SUBSCRIPTION, {
    variables: { orgId },
    skip: !orgId,
    onData: () => {
      void refetch();
    },
  });

  const devices = data?.devices || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "signage":
        return Monitor;
      case "pos":
        return Smartphone;
      case "kds":
        return Terminal;
      case "watch":
        return Watch;
      default:
        return Cpu;
    }
  };

  if (loading && !devices.length) {
    return (
      <div className="p-20 flex items-center justify-center">
        <Logo size={48} animate />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 flex items-center justify-center text-destructive">
        Error loading devices: {error.message}
      </div>
    );
  }

  return (
    <ScrollView className="flex-1 p-6 bg-background">
      <div className="flex flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest mb-2">
            Domain: Physical Edge
          </Text>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">
            Hardware Fleet
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
            Manage {devices.length} active devices in your organization.
          </p>
        </View>

        <Button
          onClick={() => router.push("/hardware/add", { scroll: false })}
          className="h-12 px-8 bg-primary hover:bg-primary/90 transition-all"
        >
          <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
            Add Device
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device: any) => {
          const Icon = getTypeIcon(device.type);
          const metadata = device.metadata ? JSON.parse(device.metadata) : {};
          const lastHeartbeat = device.lastHeartbeat
            ? new Date(device.lastHeartbeat)
            : null;
          // Determine online status based on heartbeat (e.g., within last 60 seconds)
          const isOnline =
            device.status === "online" &&
            lastHeartbeat &&
            Date.now() - lastHeartbeat.getTime() < 60000;

          return (
            <Card
              key={device.id}
              className="p-6 bg-card border-border border-2 hover:border-primary/50 transition-all flex flex-col group relative overflow-hidden"
            >
              {/* Background Decor */}
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                <Icon size={120} className="text-foreground" />
              </div>

              <div className="flex flex-row justify-between items-start mb-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-muted border border-border flex items-center justify-center shadow-2xl">
                  <Icon
                    size={24}
                    className={
                      isOnline ? "text-primary" : "text-muted-foreground"
                    }
                  />
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </div>
                  <Text className="text-[8px] font-mono text-muted-foreground/50 uppercase">
                    {device.hardwareId}
                  </Text>
                </div>
              </div>

              <View className="mb-8 relative z-10">
                <Text className="text-xl font-black text-foreground uppercase tracking-tight mb-1">
                  {device.name}
                </Text>
                <View className="flex flex-row items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-border" />
                  <Text className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    {device.type} node
                  </Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mb-8 relative z-10">
                <div className="bg-muted/40 rounded-xl p-3 border border-border/50">
                  <div className="flex flex-row items-center gap-2 mb-1">
                    <Activity size={10} className="text-muted-foreground" />
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                      Health
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-foreground uppercase truncate block">
                    {metadata.platform || "Standard"}
                  </span>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 border border-border/50">
                  <div className="flex flex-row items-center gap-2 mb-1">
                    <Wifi size={10} className="text-muted-foreground" />
                    <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">
                      Network
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-foreground uppercase truncate block">
                    {device.ipAddress || "Connected"}
                  </span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-border flex flex-row gap-2 relative z-10">
                <Button className="flex-1 h-10 bg-muted hover:bg-primary/10 group/btn border border-transparent hover:border-primary/20">
                  <View className="flex flex-row items-center justify-center gap-2">
                    <SettingsIcon
                      size={14}
                      className="text-muted-foreground group-hover/btn:text-primary"
                    />
                    <span className="text-muted-foreground group-hover/btn:text-foreground text-[10px] font-black uppercase tracking-widest">
                      Manage
                    </span>
                  </View>
                </Button>
                <Button className="h-10 w-10 bg-muted hover:bg-destructive/20 flex items-center justify-center group/del">
                  <Trash2
                    size={14}
                    className="text-muted-foreground group-hover/del:text-destructive"
                  />
                </Button>
              </div>
            </Card>
          );
        })}

        {devices.length === 0 && (
          <div className="col-span-full p-20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
            <Cpu size={48} className="text-muted mb-4" />
            <p className="text-muted-foreground font-black uppercase tracking-widest mb-4">
              No active devices found.
            </p>
            <Button
              onClick={() => router.push("/hardware/add", { scroll: false })}
              className="bg-muted px-6 h-10"
            >
              <span className="text-foreground font-black uppercase tracking-widest text-[10px]">
                Add your first device
              </span>
            </Button>
          </div>
        )}
      </div>
    </ScrollView>
  );
};
