"use client";

import React from "react";
import { View, Text } from "@sous/ui";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { Thermometer, Battery } from "lucide-react";

const GET_SENSORS = gql`
  query GetSensors($orgId: String!) {
    devices(orgId: $orgId) {
      id
      name
      type
      status
      metadata
    }
  }
`;

export const HACCPBar = ({ orgId }: { orgId: string }) => {
  const { data } = useQuery<any>(GET_SENSORS, {
    variables: { orgId },
    skip: !orgId,
    pollInterval: 30000,
  });

  const sensors = (data?.devices || [])
    .filter((d: any) => d.type === "gateway" || d.type === "sensor")
    .map((d: any) => ({
      id: d.id,
      name: d.name,
      ...JSON.parse(d.metadata || "{}"),
    }))
    .filter((s: any) => s.type === "thermometer");

  return (
    <div className="h-16 bg-zinc-950 border-t border-zinc-800/50 flex flex-row items-center px-8 gap-8">
      <div className="flex items-center gap-3 pr-8 border-r border-zinc-800/50">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.5)]" />
        <span className="text-zinc-500 font-black uppercase tracking-[0.3em] text-[10px]">
          HACCP Monitor
        </span>
      </div>
      
      <div className="flex flex-row items-center gap-6 overflow-x-auto no-scrollbar">
        {sensors.map((s: any) => (
          <div
            key={s.id}
            className="flex flex-row items-center gap-4 group"
          >
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest leading-none mb-1 group-hover:text-zinc-400 transition-colors">
                {s.name}
              </span>
              <div className="flex items-center gap-2">
                <Thermometer size={12} className="text-zinc-500" />
                <span className={cn(
                  "font-mono font-bold text-sm tracking-tighter",
                  s.temp > 5 ? "text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]" : "text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                )}>
                  {s.temp?.toFixed(1)}°{s.unit || 'C'}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-1 opacity-40">
               <Battery size={10} className={s.battery < 20 ? "text-red-500" : "text-zinc-500"} />
               <span className="text-[7px] font-mono font-bold">{s.battery}%</span>
            </div>
          </div>
        ))}

        {sensors.length === 0 && (
          <span className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest italic">
            No active sensors discovered
          </span>
        )}
      </div>
    </div>
  );
};

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
