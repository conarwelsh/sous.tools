"use client";

import React from "react";
import { View, Text, Card } from "@sous/ui";
import { Gauge, TrendingUp, Book, FileBarChart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function FinancesPage() {
  const router = useRouter();

  const sections = [
    {
      title: "Recipe Costing",
      description: "Asynchronous margin analysis and costing snapshots.",
      icon: Gauge,
      href: "/operations/intelligence/costing",
      stats: "UP TO DATE",
      group: "Intelligence"
    },
    {
      title: "Price Trends",
      description: "Identify market volatility and procurement opportunities.",
      icon: TrendingUp,
      href: "/operations/intelligence/trends",
      stats: "STABLE",
      group: "Intelligence"
    },
    {
      title: "General Ledger",
      description: "The immutable source of truth for your business.",
      icon: Book,
      href: "/operations/intelligence/ledger",
      stats: "IMMUTABLE",
      group: "Finance"
    },
    {
      title: "P&L Reports",
      description: "Statutory reporting and COGS reconciliation.",
      icon: FileBarChart,
      href: "/operations/intelligence/reports",
      stats: "0 ARCHIVED",
      group: "Finance"
    },
  ];

  return (
    <View className="flex-1 bg-background p-8">
      <View className="mb-12">
        <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
          Domain: Financial Stability & Predictive Brain
        </Text>
        <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
          Finances
        </Text>
      </View>

      <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {sections.map((s) => (
          <div
            key={s.title}
            onClick={() => router.push(s.href)}
            className="cursor-pointer"
          >
            <Card className="p-8 h-full bg-card border-border hover:border-primary/50 transition-all group flex flex-col">
              <View className="flex-row justify-between items-start mb-6">
                <View className="p-4 bg-muted rounded-2xl group-hover:bg-primary/10 transition-colors">
                  <s.icon
                    size={24}
                    className="text-muted-foreground group-hover:text-primary transition-colors"
                  />
                </View>
                <View className="items-end">
                  <Text className="text-muted-foreground/40 font-mono text-[8px] uppercase tracking-widest mb-1">
                    {s.group}
                  </Text>
                  <Text className="text-muted-foreground/60 font-mono text-[10px] uppercase tracking-widest">
                    {s.stats}
                  </Text>
                </View>
              </View>

              <Text className="text-xl font-bold text-foreground uppercase tracking-tight mb-2">
                {s.title}
              </Text>
              <Text className="text-muted-foreground text-xs leading-relaxed mb-8">
                {s.description}
              </Text>

              <View className="mt-auto flex-row items-center gap-2">
                <Text className="text-primary font-bold uppercase text-[10px] tracking-widest">
                  Open
                </Text>
                <ArrowRight size={14} className="text-primary" />
              </View>
            </Card>
          </div>
        ))}
      </View>
    </View>
  );
}
