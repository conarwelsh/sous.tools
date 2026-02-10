"use client";

import React, { useState } from "react";
import { POSLayout } from "./components/POSLayout";
import { OrderGrid } from "./components/OrderGrid";
import { Cart } from "./components/Cart";
import { useHardware } from "../hardware/hooks/useHardware";
import { Logo, KioskLoading } from "@sous/ui";

export const POSFeature = () => {
  const { isPaired, pairingCode, isLoading } = useHardware("pos");
  const [cart, setCart] = useState<any[]>([]);

  const handleAddItem = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handlePay = async () => {
    // 1. Process Payment (Mock)
    console.log("Processing payment...");

    // 2. Print Receipt (Placeholder)
    console.log("Printing receipt...");

    // 3. Clear
    setCart([]);
  };

  // Mock Menu
  const menuItems = [
    { id: "1", name: "Burger", price: 1200 },
    { id: "2", name: "Fries", price: 500 },
    { id: "3", name: "Soda", price: 300 },
    { id: "4", name: "Salad", price: 900 },
  ];

  if (isLoading) {
    return <KioskLoading suffix="pos" />;
  }

  if (!isPaired) {
    return (
      <div className="flex-1 bg-black flex flex-col items-center justify-center p-8 text-center min-h-screen">
        <Logo size={64} animate suffix="pos" className="mb-12" />
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">
          Pair POS Terminal
        </h1>
        <p className="text-zinc-500 max-w-md mb-12">
          This point of sale terminal is not yet paired. Enter the code below in
          your manager dashboard under Hardware.
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
    <POSLayout>
      <OrderGrid items={menuItems} onItemPress={handleAddItem} />
      <Cart items={cart} onPay={handlePay} onClear={() => setCart([])} />
    </POSLayout>
  );
};
