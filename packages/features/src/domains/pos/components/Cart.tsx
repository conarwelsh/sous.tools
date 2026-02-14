"use client";

import React, { useState } from "react";
import { Button, Card, View, Text, ScrollView, cn } from "@sous/ui";
import {
  Loader2,
  Plus,
  Minus,
  Trash2,
  Send,
  CreditCard,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Props {
  items: CartItem[];
  onPay: () => void;
  onSend: () => void;
  onClear: () => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  isSubmitting?: boolean;
}

export const Cart = ({
  items,
  onPay,
  onSend,
  onClear,
  onUpdateQty,
  onRemove,
  isSubmitting,
}: Props) => {
  const [orderType, setOrderType] = useState<"dine-in" | "takeout">("dine-in");
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = subtotal * 0.08; // Mock 8% tax
  const total = subtotal + tax;

  return (
    <div className="w-[400px] border-l border-white/5 bg-zinc-950/50 backdrop-blur-2xl flex flex-col h-screen z-10 shadow-[-20px_0_80px_rgba(0,0,0,0.8)] relative">
      {/* Glow Effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] pointer-events-none" />

      {/* Header & Toggle */}
      <div className="p-8 pb-6 space-y-6 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-zinc-500">
              Active Terminal
            </h2>
            <h1 className="text-2xl font-black uppercase tracking-tighter italic text-white leading-none mt-1">
              Cart{" "}
              <span className="text-sky-500 drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                Manifest
              </span>
            </h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
            onClick={onClear}
          >
            <Trash2 size={18} />
          </Button>
        </div>

        <div className="flex bg-black/40 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
          <button
            onClick={() => setOrderType("dine-in")}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
              orderType === "dine-in"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 neon-glow"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
            )}
          >
            Dine In
          </button>
          <button
            onClick={() => setOrderType("takeout")}
            className={cn(
              "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500",
              orderType === "takeout"
                ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 neon-glow"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
            )}
          >
            Takeout
          </button>
        </div>
      </div>

      {/* Items List */}
      <ScrollView className="flex-1 px-8 relative z-10">
        <AnimatePresence initial={false}>
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-zinc-700 py-32 gap-6 opacity-40">
              <div className="w-20 h-20 rounded-[2rem] border border-zinc-800 flex items-center justify-center bg-zinc-900/20">
                <Plus size={32} className="animate-pulse" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-center">
                Manifest Awaiting
                <br />
                Inbound Items
              </span>
            </div>
          ) : (
            <div className="space-y-4 pb-8">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white/5 border border-white/5 p-5 rounded-[2rem] group hover:border-sky-500/30 hover:bg-sky-500/5 transition-all duration-500"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="font-black text-white text-[13px] uppercase tracking-tight italic group-hover:text-sky-400 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                        Standard Option
                      </span>
                    </div>
                    <span className="font-mono text-white font-black text-sm drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center bg-black/40 rounded-2xl border border-white/5 p-1 backdrop-blur-md">
                      <button
                        onClick={() => onUpdateQty(item.id, -1)}
                        className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-10 text-center font-mono font-black text-sky-500 text-xs">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, 1)}
                        className="w-9 h-9 flex items-center justify-center text-zinc-500 hover:text-white transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => onRemove(item.id)}
                      className="h-11 px-5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-red-500 hover:bg-red-500/5 transition-all"
                    >
                      Remove
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </ScrollView>

      {/* Summary & Actions */}
      <div className="p-8 pt-6 bg-black/40 backdrop-blur-3xl border-t border-white/5 space-y-8 relative z-10 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] px-1">
            <span className="text-zinc-500 font-black uppercase tracking-[0.2em]">
              Subtotal
            </span>
            <span className="text-zinc-300 font-mono font-bold">
              ${(subtotal / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] px-1 pb-4 border-b border-white/5">
            <span className="text-zinc-500 font-black uppercase tracking-[0.2em]">
              Tax Service (8%)
            </span>
            <span className="text-zinc-300 font-mono font-bold">
              ${(tax / 100).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-end pt-4 px-1">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-sky-500 uppercase tracking-[0.4em] mb-1">
                Due Amount
              </span>
              <span className="text-lg font-black text-white uppercase tracking-[0.2em] leading-none italic">
                Order Total
              </span>
            </div>
            <span className="text-4xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
              ${(total / 100).toFixed(2)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="h-16 rounded-[1.5rem] border-white/5 bg-white/5 hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/20 text-zinc-400 transition-all duration-500 group relative overflow-hidden"
            onClick={onSend}
            disabled={isSubmitting || items.length === 0}
          >
            <Send
              size={18}
              className="mr-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
            />
            <span className="font-black uppercase tracking-[0.25em] text-[10px]">
              Send to Kitchen
            </span>
          </Button>

          <Button
            className="h-20 rounded-[1.5rem] bg-sky-500 hover:bg-sky-400 text-white shadow-xl shadow-sky-500/20 transition-all duration-500 hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
            onClick={onPay}
            disabled={isSubmitting || items.length === 0}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
            <CreditCard
              size={22}
              className="mr-4 group-hover:scale-110 transition-transform"
            />
            <span className="font-black uppercase tracking-[0.2em] text-sm italic">
              Initialize Checkout
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};
