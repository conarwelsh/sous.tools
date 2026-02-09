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
  Trash2
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
      case "signage": return Monitor;
      case "pos": return Smartphone;
      case "kds": return Terminal;
      case "watch": return Watch;
      default: return Cpu;
    }
  };

  if (loading && !devices.length) {
    return (
      <div className="p-20 flex items-center justify-center">
        <Logo variant="cloud" size={48} animate />
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
    <ScrollView className="flex-1 p-6">
      <div className="flex flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-[10px] tracking-widest mb-2">
            Domain: Physical Edge
          </Text>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase mb-2">
            Hardware Fleet
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
            Manage {devices.length} active devices in your organization.
          </p>
        </View>

        <Button
          onClick={() => router.push("/hardware/add", { scroll: false })}
          className="h-12 px-8 bg-sky-500 hover:bg-sky-400 transition-all"
        >
          <span className="text-white font-black uppercase tracking-widest text-xs">
            Add Device
          </span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {devices.map((device: any) => {
          const Icon = getTypeIcon(device.type);
          const metadata = device.metadata ? JSON.parse(device.metadata) : {};
          const lastHeartbeat = device.lastHeartbeat ? new Date(device.lastHeartbeat) : null;
          // Determine online status based on heartbeat (e.g., within last 60 seconds)
          const isOnline = device.status === "online" && (lastHeartbeat && Date.now() - lastHeartbeat.getTime() < 60000);

          return (
            <Card
              key={device.id}
              className="p-6 bg-zinc-900 border-zinc-800 border-2 hover:border-zinc-700 transition-all flex flex-col group relative overflow-hidden"
            >
              {/* Background Decor */}
              <div className="absolute -right-4 -top-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <Icon size={120} color="white" />
              </div>

              <div className="flex flex-row justify-between items-start mb-8 relative z-10">
                <div className="h-14 w-14 rounded-2xl bg-black border border-zinc-800 flex items-center justify-center shadow-2xl">
                  <Icon size={24} className={isOnline ? "text-sky-500" : "text-zinc-700"} />
                </div>
                <div className="flex flex-col items-end">
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 ${isOnline ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"}`}
                  >
                    {isOnline ? "Online" : "Offline"}
                  </div>
                  <Text className="text-[8px] font-mono text-zinc-600 uppercase">
                      {device.hardwareId}
                  </Text>
                </div>
              </div>

              <View className="mb-8 relative z-10">
                <Text className="text-xl font-black text-white uppercase tracking-tight mb-1">
                  {device.name}
                </Text>
                <View className="flex flex-row items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <Text className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                    {device.type} node
                  </Text>
                </View>
              </View>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mb-8 relative z-10">
                  <div className="bg-black/40 rounded-xl p-3 border border-zinc-800/50">
                    <div className="flex flex-row items-center gap-2 mb-1">
                        <Activity size={10} className="text-zinc-600" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Health</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase truncate block">
                        {metadata.platform || "Standard"}
                    </span>
                  </div>
                  <div className="bg-black/40 rounded-xl p-3 border border-zinc-800/50">
                    <div className="flex flex-row items-center gap-2 mb-1">
                        <Wifi size={10} className="text-zinc-600" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Network</span>
                    </div>
                    <span className="text-[10px] font-bold text-zinc-300 uppercase truncate block">
                        {device.ipAddress || "Connected"}
                    </span>
                  </div>
              </div>

              <div className="mt-auto pt-6 border-t border-zinc-800/50 flex flex-row gap-2 relative z-10">
                <Button className="flex-1 h-10 bg-zinc-800 hover:bg-sky-500/10 group/btn border border-transparent hover:border-sky-500/20">
                  <View className="flex flex-row items-center justify-center gap-2">
                      <SettingsIcon size={14} className="text-zinc-500 group-hover/btn:text-sky-500" />
                      <span className="text-zinc-400 group-hover/btn:text-white text-[10px] font-black uppercase tracking-widest">
                        Manage
                      </span>
                  </View>
                </Button>
                <Button className="h-10 w-10 bg-zinc-800 hover:bg-destructive/20 flex items-center justify-center group/del">
                  <Trash2 size={14} className="text-zinc-600 group-hover/del:text-destructive" />
                </Button>
              </div>
            </Card>
          );
        })}

        {devices.length === 0 && (
          <div className="col-span-full p-20 border-2 border-dashed border-zinc-800 rounded-3xl flex flex-col items-center justify-center text-center">
            <Cpu size={48} className="text-zinc-800 mb-4" />
            <p className="text-zinc-600 font-black uppercase tracking-widest mb-4">
              No active devices found.
            </p>
            <Button
              onClick={() => router.push("/hardware/add", { scroll: false })}
              className="bg-zinc-800 px-6 h-10"
            >
              <span className="text-white font-black uppercase tracking-widest text-[10px]">
                Add your first device
              </span>
            </Button>
          </div>
        )}
      </div>
    </ScrollView>
  );
};