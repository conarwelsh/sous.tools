"use client";

import React, { useState } from "react";
import {
  Timer,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Utensils,
} from "lucide-react";

// --- Mock Data ---
const INITIAL_ORDERS = [
  {
    id: "101",
    table: "T-04",
    time: "04:20",
    status: "normal",
    items: [
      { qty: 2, name: "Ribeye Steak", mod: "Med-Rare" },
      { qty: 1, name: "Duck Confit", mod: "Extra Crispy" },
    ],
  },
  {
    id: "102",
    table: "T-12",
    time: "12:45",
    status: "warning",
    items: [
      { qty: 4, name: "Sous Burger", mod: "No Onions" },
      { qty: 2, name: "Truffle Fries", mod: "" },
    ],
  },
  {
    id: "103",
    table: "BAR-2",
    time: "18:10",
    status: "critical",
    items: [{ qty: 1, name: "Seared Scallops", mod: "Allergy: Shellfish" }],
  },
];

export default function KDSPreview() {
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const bumpOrder = (id: string) => {
    setOrders((prev) => prev.filter((order) => order.id !== id));
  };

  return (
    <div
      className="min-h-screen flex flex-col font-sans"
      style={{
        backgroundColor: "oklch(0.12 0.01 240)",
        color: "oklch(0.98 0.01 240)",
      }}
    >
      {/* --- KDS HEADER --- */}
      <header className="border-b border-white/10 p-4 flex justify-between items-center bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "oklch(0.60 0.25 250)" }}
          >
            <Utensils className="text-black" size={24} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tighter leading-none font-brand">
              SOUS.TOOLS
            </h1>
            <span className="text-[10px] font-mono opacity-50 uppercase tracking-widest">
              Station: GRILL_01
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <div className="px-4 py-2 rounded-md border border-emerald-500/50 bg-emerald-500/10 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-mono text-sm">LIVE: 03 ORDERS</span>
          </div>
        </div>
      </header>

      {/* --- TICKET RAIL --- */}
      <main className="flex-1 overflow-x-auto flex gap-6 p-6 items-start">
        {orders.map((order) => (
          <div
            key={order.id}
            className="w-80 flex-shrink-0 rounded-[0.8rem] border overflow-hidden transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
            style={{
              borderColor:
                order.status === "critical"
                  ? "oklch(0.60 0.25 25)"
                  : "rgba(255,255,255,0.1)",
              backgroundColor: "oklch(0.15 0.01 240)",
            }}
          >
            {/* Ticket Header */}
            <div
              className={cn(
                "p-3 flex justify-between items-center border-b border-white/10",
                order.status === "critical" ? "bg-red-950/40" : "bg-white/5",
              )}
            >
              <span className="font-brand font-extrabold text-lg">
                {order.table}
              </span>
              <div className="flex items-center gap-1.5 font-mono text-lg font-bold">
                <Timer
                  size={18}
                  className={
                    order.status === "critical"
                      ? "text-red-500"
                      : "text-blue-400"
                  }
                />
                <span
                  className={
                    order.status === "critical"
                      ? "text-red-500"
                      : "text-blue-400"
                  }
                >
                  {order.time}
                </span>
              </div>
            </div>

            {/* Ticket Items */}
            <div className="p-0 flex flex-col">
              {order.items.map((item, idx) => (
                <button
                  key={idx}
                  className="group flex items-start gap-4 p-4 border-b border-white/5 text-left active:bg-white/10 transition-colors"
                >
                  <span className="font-mono text-2xl font-black text-blue-500 leading-none min-w-[1.5ch]">
                    {item.qty}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-md font-bold uppercase tracking-tight group-focus:line-through">
                      {item.name}
                    </span>
                    {item.mod && (
                      <span className="text-xs text-amber-500 font-mono font-bold uppercase mt-1">
                        {item.mod}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Bump Button */}
            <button
              onClick={() => bumpOrder(order.id)}
              className="w-full py-5 text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all"
              style={{ backgroundColor: "oklch(0.60 0.25 250)" }}
            >
              <CheckCircle2 size={20} strokeWidth={3} />
              BUMP
            </button>
          </div>
        ))}
      </main>
    </div>
  );
}

// Utility for class merging
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
