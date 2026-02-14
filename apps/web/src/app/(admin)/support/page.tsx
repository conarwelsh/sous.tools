"use client";

import React from "react";
import {
  View,
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@sous/ui";
import { SupportForm } from "@sous/features";
import { LifeBuoy } from "lucide-react";

export default function SupportPage() {
  return (
    <View className="flex-1 p-6 md:p-12 max-w-5xl mx-auto space-y-12">
      <View className="space-y-4">
        <View className="flex flex-row items-center gap-4">
          <View className="p-3 bg-primary/10 rounded-2xl">
            <LifeBuoy size={32} className="text-primary" />
          </View>
          <View>
            <Text className="text-4xl font-black italic uppercase tracking-tighter">
              Support Center
            </Text>
            <Text className="text-muted-foreground">
              We're here to help you get the most out of Sous.
            </Text>
          </View>
        </View>
      </View>

      <View className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <View className="lg:col-span-2">
          <Card className="border-border/50 shadow-xl shadow-primary/5 rounded-[2rem] overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50 p-8">
              <CardTitle className="text-xl font-bold uppercase tracking-tight">
                Submit a Request
              </CardTitle>
              <CardDescription>
                Please provide as much detail as possible so we can assist you
                better.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <SupportForm />
            </CardContent>
          </Card>
        </View>

        <View className="space-y-6">
          <Card className="border-border/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Text className="text-sm">
                Looking for guides or API references? Our documentation hub has
                everything you need.
              </Text>
              <a
                href="/docs"
                className="text-primary font-bold uppercase text-[10px] tracking-widest hover:underline"
              >
                Explore Docs →
              </a>
            </CardContent>
          </Card>

          <Card className="border-border/50 rounded-2xl">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <View className="flex flex-row items-center gap-2">
                <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <Text className="font-medium text-sm">
                  All Systems Operational
                </Text>
              </View>
              <Text className="text-muted-foreground text-[10px] uppercase">
                Last checked: Just now
              </Text>
            </CardContent>
          </Card>
        </View>
      </View>
    </View>
  );
}
