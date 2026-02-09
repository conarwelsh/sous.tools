"use client";

import React from "react";
import { View, Text, Button, Card } from "@sous/ui";
import { Book, FileBarChart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function AccountingPage() {
  const router = useRouter();

  const sections = [
    {
      title: "General Ledger",
      description: "The immutable source of truth for your business.",
      icon: Book,
      href: "/accounting/ledger",
      stats: "IMMUTABLE",
    },
    {
      title: "P&L Reports",
      description: "Statutory reporting and COGS reconciliation.",
      icon: FileBarChart,
      href: "/accounting/reports",
      stats: "0 ARCHIVED",
    },
  ];

  return (
    <View className="flex-1 bg-[#0a0a0a] p-8">
      <View className="mb-12">
        <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
          Domain: Financial Stability
        </Text>
        <Text className="text-4xl font-black text-white uppercase tracking-tighter">
          Accounting
        </Text>
      </View>

      <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {sections.map((s) => (
          <div
            key={s.title}
            onClick={() => router.push(s.href)}
            className="cursor-pointer"
          >
            <Card className="h-full p-8 bg-zinc-900 border-zinc-800 hover:border-sky-500/50 transition-all group flex flex-col">
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-4 bg-zinc-800 rounded-2xl group-hover:bg-sky-500/10 transition-colors">
                  <s.icon
                    size={24}
                    className="text-zinc-400 group-hover:text-sky-500 transition-colors"
                  />
                </View>
                <Text className="text-zinc-700 font-mono text-[10px] uppercase tracking-widest">
                  {s.stats}
                </Text>
              </View>

              <Text className="text-2xl font-bold text-white uppercase tracking-tight mb-2">
                {s.title}
              </Text>
              <Text className="text-zinc-500 text-sm leading-relaxed mb-8">
                {s.description}
              </Text>

              <View className="mt-auto flex-row items-center gap-2">
                <Text className="text-sky-500 font-bold uppercase text-[10px] tracking-widest">
                  Open Manager
                </Text>
                <ArrowRight size={14} className="text-sky-500" />
              </View>
            </Card>
          </div>
        ))}
      </View>
    </View>
  );
}