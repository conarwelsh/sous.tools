"use client";

import React from "react";
import { Card, ScrollView } from "@sous/ui";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  color?: string;
  isSoldOut?: boolean;
}

interface Props {
  items: MenuItem[];
  onItemPress: (item: MenuItem) => void;
}

export const OrderGrid = ({ items, onItemPress }: Props) => {
  return (
    <ScrollView className="flex-1 p-8">
      <motion.div 
        layout
        className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              onClick={() => !item.isSoldOut && onItemPress(item)}
              className="relative aspect-[4/3] outline-none group"
              disabled={item.isSoldOut}
            >
              <Card className={`h-full flex flex-col items-center justify-center p-6 bg-zinc-900/40 border-2 transition-all duration-300 rounded-[2.5rem] overflow-hidden ${
                item.isSoldOut 
                  ? "border-zinc-800 opacity-50 grayscale" 
                  : "border-zinc-800/50 group-hover:border-primary group-hover:bg-zinc-800/40 group-hover:neon-glow transition-all"
              }`}>
                {/* Subtle Background Glow */}
                {!item.isSoldOut && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                )}

                <span className="text-sm font-black text-center text-white uppercase tracking-tighter leading-[1.1] mb-4 px-2 line-clamp-2 z-10 group-hover:text-primary transition-colors">
                  {item.name}
                </span>
                
                <div className="flex flex-row items-center gap-3 z-10">
                  <div className="h-[1px] w-4 bg-zinc-800 group-hover:bg-primary/50 transition-colors" />
                  <span className="text-primary font-black font-mono text-sm tracking-tighter">
                    ${(item.price / 100).toFixed(2)}
                  </span>
                  <div className="h-[1px] w-4 bg-zinc-800 group-hover:bg-primary/50 transition-colors" />
                </div>

                {item.isSoldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-[2rem] z-10">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 -rotate-12 border-2 border-red-500 px-3 py-1 rounded-lg">
                      Sold Out
                    </span>
                  </div>
                )}
              </Card>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </ScrollView>
  );
};
