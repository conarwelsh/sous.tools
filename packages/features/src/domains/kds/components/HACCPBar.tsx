"use client";

import React, { useEffect, useState } from "react";
import { View, Text } from "@sous/ui";

export interface BLEDevice {
  id: string;
  name: string;
  temperature?: number;
}

export const HACCPBar = () => {
  const [devices, setDevices] = useState<BLEDevice[]>([]);

  useEffect(() => {
    // Note: In Web/Capacitor we use different APIs for BLE.
    // This is a placeholder for the new implementation.
  }, []);

  return (
    <div className="h-[60px] bg-black border-t border-zinc-800 flex flex-row items-center px-4 gap-4">
      <span className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">
        HACCP MONITOR
      </span>
      {devices.map((d) => (
        <div
          key={d.id}
          className="bg-zinc-900 px-3 py-1.5 rounded-full flex flex-row gap-2 border border-zinc-800"
        >
          <span className="text-xs font-medium text-zinc-400">{d.name}</span>
          <span
            className={`font-mono font-bold ${d.temperature && d.temperature > 40 ? "text-destructive" : "text-emerald-500"}`}
          >
            {d.temperature}°C
          </span>
        </div>
      ))}
    </div>
  );
};
