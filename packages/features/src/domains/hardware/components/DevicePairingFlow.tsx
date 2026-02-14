"use client";

import React, { useState, useEffect } from "react";
import { View, Text, Logo, Button, cn } from "@sous/ui";
import { useHardware } from "../hooks/useHardware";
import {
  Wifi,
  WifiOff,
  RefreshCcw,
  ShieldCheck,
  Monitor,
  ShoppingCart,
  Utensils,
} from "lucide-react";

interface DevicePairingFlowProps {
  type: "kds" | "pos" | "signage";
  children: (props: { hardwareId: string; socket: any }) => React.ReactNode;
}

export const DevicePairingFlow: React.FC<DevicePairingFlowProps> = ({
  type,
  children,
}) => {
  const {
    hardwareId,
    pairingCode,
    isPaired,
    isLoading,
    socket,
    refreshPairingCode,
  } = useHardware(type);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getFlavorConfig = () => {
    switch (type) {
      case "kds":
        return {
          label: "Sous KDS",
          icon: Utensils,
          color: "text-purple-500",
          bg: "bg-purple-500/10",
        };
      case "pos":
        return {
          label: "Sous POS",
          icon: ShoppingCart,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "signage":
        return {
          label: "Sous Signage",
          icon: Monitor,
          color: "text-sky-500",
          bg: "bg-sky-500/10",
        };
      default:
        return {
          label: "Sous Node",
          icon: Monitor,
          color: "text-zinc-500",
          bg: "bg-zinc-500/10",
        };
    }
  };

  const flavor = getFlavorConfig();

  if (isLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-8">
        <Logo size={64} animate suffix={type} className="mb-12 opacity-20" />
        <div className="flex flex-col items-center gap-4">
          <RefreshCcw size={32} className="text-zinc-800 animate-spin" />
          <Text className="text-zinc-600 font-black uppercase tracking-[0.2em] text-[10px]">
            Initializing Hardware...
          </Text>
        </div>
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View className="flex-1 bg-black items-center justify-center p-12 text-center">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-8">
          <WifiOff size={40} className="text-red-500" />
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Connection Lost
        </h1>
        <p className="text-zinc-500 max-w-sm mb-12 leading-relaxed">
          This device is offline. Please check your network connection to resume
          operations.
        </p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          className="h-12 px-8 border-zinc-800"
        >
          <span className="text-white font-black uppercase tracking-widest text-[10px]">
            Retry Connection
          </span>
        </Button>
      </View>
    );
  }

  if (!isPaired) {
    return (
      <View className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center">
        <div
          className={cn(
            "px-4 py-1.5 rounded-full mb-12 border border-current flex flex-row items-center gap-2",
            flavor.bg,
            flavor.color,
          )}
        >
          <flavor.icon size={12} />
          <Text className="font-black text-[10px] uppercase tracking-widest">
            {flavor.label}
          </Text>
        </div>

        <Logo size={80} animate suffix={type} className="mb-16" />

        <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-6">
          Pair Device
        </h1>
        <p className="text-zinc-500 max-w-md mb-16 text-lg font-medium leading-relaxed">
          To activate this node, go to your manager dashboard at{" "}
          <Text className="text-sky-500 font-bold">sous.tools</Text> and enter
          the code below.
        </p>

        <View className="bg-zinc-900 border-2 border-zinc-800 rounded-[3rem] p-16 shadow-[0_0_100px_rgba(0,0,0,0.5)] relative group">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-sky-500 px-4 py-1 rounded-full shadow-lg">
            <Text className="text-white font-black text-[8px] uppercase tracking-widest">
              Single-use Pairing Code
            </Text>
          </div>
          <Text className="text-8xl font-mono font-black text-sky-500 tracking-[0.2em] ml-[0.2em] select-all">
            {pairingCode || "------"}
          </Text>
        </View>

        <div className="mt-20 flex flex-row items-center gap-3 text-zinc-700">
          <ShieldCheck size={16} />
          <Text className="font-bold uppercase text-[10px] tracking-widest">
            Hardware ID: {hardwareId?.substring(0, 12)}...
          </Text>
        </div>

        <Button
          onClick={refreshPairingCode}
          variant="ghost"
          className="mt-8 text-zinc-600 hover:text-zinc-400 gap-2"
        >
          <RefreshCcw size={12} />
          <span className="text-[10px] font-black uppercase">Refresh Code</span>
        </Button>
      </View>
    );
  }

  // If paired, we render the actual app content
  return <>{children({ hardwareId: hardwareId!, socket })}</>;
};
