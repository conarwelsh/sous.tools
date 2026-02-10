"use client";

import React, { useState } from "react";
import { ScrollView, Logo, KioskLoading } from "@sous/ui";
import { OrderTicket } from "./components/OrderTicket";
import { HACCPBar } from "./components/HACCPBar";
import { useHardware } from "../hardware/hooks/useHardware";

export const KDSFeature = () => {
  const { isPaired, pairingCode, isLoading } = useHardware("kds");
  const [orders, setOrders] = useState([
    {
      id: "1",
      number: 101,
      createdAt: new Date(Date.now() - 1000 * 60 * 2),
      items: [{ name: "Burger", quantity: 1 }],
    },
    {
      id: "2",
      number: 102,
      createdAt: new Date(Date.now() - 1000 * 60 * 12),
      items: [{ name: "Fries", quantity: 2 }],
    },
  ]);

  const handleBump = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
  };

  if (isLoading) {
    return <KioskLoading suffix="kds" />;
  }

  if (!isPaired) {
    return (
      <div className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Logo size={64} animate suffix="kds" className="mb-12" />
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Pair KDS Terminal
        </h1>
        <p className="text-zinc-500 max-w-md mb-12">
          This kitchen display system is not yet paired with an organization.
          Enter the code below in your manager dashboard under Hardware.
        </p>

        {pairingCode ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-12 shadow-2xl">
            <span className="text-7xl font-mono font-black text-sky-500 tracking-[0.2em] ml-[0.2em]">
              {pairingCode}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <p className="text-red-500 font-bold uppercase text-xs tracking-widest">
              Failed to load pairing code.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-zinc-800 px-6 py-2 rounded-xl text-white font-black uppercase text-[10px] tracking-widest"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#0a0a0a] min-h-screen flex flex-col overflow-hidden">
      <ScrollView className="flex-1 p-4">
        <div className="flex flex-row flex-wrap gap-2">
          {orders.map((order) => (
            <OrderTicket key={order.id} order={order} onBump={handleBump} />
          ))}
        </div>
      </ScrollView>
      <HACCPBar />
    </div>
  );
};
