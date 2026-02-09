"use client";

import React, { useState } from "react";
import {
  ShoppingBag,
  Trash2,
  CreditCard,
  ChevronRight,
  Settings,
  Users,
  Search,
  X,
  Check,
} from "lucide-react";

// --- Types & Data ---
const CATEGORIES = ["Apps", "Mains", "Sides", "Drinks", "Desserts"];
const MENU_ITEMS = [
  {
    id: 1,
    name: "Ribeye",
    price: 42.0,
    cat: "Mains",
    color: "oklch(0.60 0.25 250)",
  },
  {
    id: 2,
    name: "Sous Burger",
    price: 18.5,
    cat: "Mains",
    color: "oklch(0.60 0.25 250)",
  },
  {
    id: 3,
    name: "Truffle Fries",
    price: 12.0,
    cat: "Sides",
    color: "oklch(0.65 0.25 45)",
  },
  {
    id: 4,
    name: "Oysters (6)",
    price: 24.0,
    cat: "Apps",
    color: "oklch(0.70 0.25 150)",
  },
  {
    id: 5,
    name: "Old Fashioned",
    price: 15.0,
    cat: "Drinks",
    color: "oklch(0.85 0.20 85)",
  },
];

export default function POSSystem() {
  const [cart, setCart] = useState<{ item: any; qty: number }[]>([]);
  const [activeCat, setActiveCat] = useState("Mains");
  const [showPayDrawer, setShowPayDrawer] = useState(false);

  const subtotal = cart.reduce(
    (acc, curr) => acc + curr.item.price * curr.qty,
    0,
  );

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.item.id === item.id);
      if (existing)
        return prev.map((i) =>
          i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { item, qty: 1 }];
    });
  };

  return (
    <div className="h-screen flex overflow-hidden font-sans bg-[oklch(0.12_0.01_240)] text-[oklch(0.98_0.01_240)]">
      {/* --- LEFT: TICKET RAIL (30%) --- */}
      <aside className="w-96 border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-6 border-b border-white/10 flex justify-between items-end">
          <div>
            <h2 className="font-brand font-black text-2xl tracking-tighter">
              CHECK #1402
            </h2>
            <p className="text-xs font-mono opacity-50 uppercase">
              Server: Marco • Table 04
            </p>
          </div>
          <Users size={20} className="text-blue-400" />
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {cart.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-20 italic">
              <ShoppingBag size={48} className="mb-2" />
              <p>Empty Check</p>
            </div>
          )}
          {cart.map((line, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 animate-in slide-in-from-left-2"
            >
              <div className="flex gap-3 items-center">
                <span className="font-mono font-black text-blue-500">
                  {line.qty}x
                </span>
                <span className="font-bold uppercase tracking-tight text-sm">
                  {line.item.name}
                </span>
              </div>
              <span className="font-mono">
                ${(line.item.price * line.qty).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="p-6 bg-black/40 border-t border-white/10 space-y-4">
          <div className="flex justify-between font-mono text-xl font-black">
            <span>TOTAL</span>
            <span className="text-emerald-400">${subtotal.toFixed(2)}</span>
          </div>
          <button
            onClick={() => setShowPayDrawer(true)}
            disabled={cart.length === 0}
            className="w-full py-6 rounded-[0.8rem] bg-[oklch(0.60_0.25_250)] text-black font-black uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-20"
          >
            <CreditCard size={24} /> PAY NOW
          </button>
        </div>
      </aside>

      {/* --- RIGHT: GRID (70%) --- */}
      <main className="flex-1 flex flex-col">
        {/* Category Nav */}
        <nav className="p-4 flex gap-2 border-b border-white/10 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-8 py-4 rounded-full font-black uppercase tracking-tighter transition-all ${
                activeCat === cat
                  ? "bg-white text-black scale-105"
                  : "bg-white/5 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Items Grid */}
        <div className="flex-1 p-6 grid grid-cols-3 gap-4 content-start">
          {MENU_ITEMS.filter((i) => i.cat === activeCat).map((item) => (
            <button
              key={item.id}
              onClick={() => addToCart(item)}
              className="h-32 rounded-[0.8rem] border border-white/10 bg-white/5 flex flex-col justify-between p-4 text-left hover:border-blue-500/50 active:scale-95 transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 -rotate-45 translate-x-8 -translate-y-8 group-hover:bg-blue-500/20 transition-colors" />
              <span className="font-brand font-black text-lg leading-none uppercase">
                {item.name}
              </span>
              <span className="font-mono text-xl font-bold opacity-60">
                ${item.price.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </main>

      {/* --- PAYMENT DRAWER (OVERLAY) --- */}
      {showPayDrawer && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-300">
          <div className="w-[500px] h-full bg-[oklch(0.15_0.01_240)] border-l border-white/20 p-8 shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-12">
              <h3 className="font-brand font-black text-4xl tracking-tighter">
                SETTLE
              </h3>
              <button
                onClick={() => setShowPayDrawer(false)}
                className="p-2 bg-white/10 rounded-full"
              >
                <X />
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-6 rounded-xl border border-white/10 bg-black/20">
                <p className="text-xs uppercase font-mono opacity-50 mb-1">
                  Amount Due
                </p>
                <p className="text-5xl font-mono font-black text-emerald-400">
                  ${subtotal.toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {["CASH", "DEBIT", "CREDIT", "APPLE PAY"].map((method) => (
                  <button
                    key={method}
                    className="py-8 border border-white/10 rounded-xl font-black hover:bg-blue-500 hover:text-black transition-all uppercase"
                  >
                    {method}
                  </button>
                ))}
              </div>

              <button
                onClick={() => {
                  setCart([]);
                  setShowPayDrawer(false);
                }}
                className="w-full py-8 bg-emerald-500 text-black font-black text-2xl rounded-xl mt-12 flex items-center justify-center gap-3"
              >
                <Check size={32} strokeWidth={4} /> COMPLETE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
