"use client";

import React from "react";
import { View, Text, Card } from "@sous/ui";
import { Truck, FileText, ShoppingBag, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProcurementDashboardView() {
  const router = useRouter();

  const sections = [
    {
      title: "Suppliers",
      description: "Manage vendor relationships and catalogs.",
      icon: Truck,
      href: "/procurement/suppliers",
      stats: "0 Active",
    },
    {
      title: "Invoices",
      description: "Process and track historical purchase data.",
      icon: FileText,
      href: "/procurement/invoices",
      stats: "0 Pending",
    },
    {
      title: "Order Manager",
      description: "Collaborative procurement and vendor wars.",
      icon: ShoppingBag,
      href: "/procurement/orders",
      stats: "Empty",
    },
  ];

  return (
    <View className="flex-1 bg-background p-8">
      <View className="mb-12">
        <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
          Domain: Supply Chain
        </Text>
        <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
          Procurement
        </Text>
      </View>

      <View className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <Text className="text-muted-foreground/50 font-mono text-[10px] uppercase tracking-widest">
                  {s.stats}
                </Text>
              </View>

              <Text className="text-2xl font-bold text-foreground uppercase tracking-tight mb-2">
                {s.title}
              </Text>
              <Text className="text-muted-foreground text-sm leading-relaxed mb-8">
                {s.description}
              </Text>

              <View className="mt-auto flex-row items-center gap-2">
                <Text className="text-primary font-bold uppercase text-[10px] tracking-widest">
                  Open Manager
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
