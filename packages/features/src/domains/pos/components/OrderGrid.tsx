"use client";

import React from "react";
import { Card, ScrollView } from "@sous/ui";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  color?: string;
}

interface Props {
  items: MenuItem[];
  onItemPress: (item: MenuItem) => void;
}

export const OrderGrid = ({ items, onItemPress }: Props) => {
  return (
    <ScrollView className="flex-1 p-6">
      <motion.div 
        layout
        className="flex flex-row flex-wrap gap-4 justify-center md:justify-start"
      >
        <AnimatePresence mode="popLayout">
          {items.map((item) => (
            <motion.button
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              onClick={() => onItemPress(item)}
              className="w-[160px] h-[130px] outline-none group"
            >
              <Card className="h-full flex flex-col items-center justify-center p-4 bg-zinc-900 border-zinc-800 border-2 group-hover:border-primary/50 group-hover:bg-zinc-800/50 transition-all shadow-xl">
                <span className="text-sm font-black text-center text-white uppercase tracking-tighter leading-tight mb-2 px-2 line-clamp-2">
                  {item.name}
                </span>
                <span className="text-primary font-black font-mono text-xs tracking-widest">
                  ${(item.price / 100).toFixed(2)}
                </span>
              </Card>
            </motion.button>
          ))}
        </AnimatePresence>
      </motion.div>
    </ScrollView>
  );
};
