"use client";

import React, { Suspense } from "react";
import { View, Text, Button, Card } from "@sous/ui";
import { FileBarChart, Download, Loader2 } from "lucide-react";

function ReportsContent() {
  return (
    <View className="flex-1 bg-background p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
            Finances / Compliance
          </Text>
          <Text className="text-4xl font-black text-foreground uppercase tracking-tighter">
            P&L Reports
          </Text>
        </View>
        <Button className="bg-primary hover:bg-primary/90 px-6 h-12">
          <View className="flex-row items-center gap-2">
            <Download size={18} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
              Generate Report
            </Text>
          </View>
        </Button>
      </View>

      <Card className="p-8 bg-card border-border items-center justify-center border-dashed min-h-[400px]">
        <FileBarChart size={48} className="text-muted-foreground/20 mb-4" />
        <Text className="text-muted-foreground font-bold uppercase text-xs tracking-widest mb-2">
          No Reports Available
        </Text>
        <Text className="text-muted-foreground/60 text-sm max-w-xs text-center">
          Statutory reports and COGS reconciliation summaries will be archived
          here.
        </Text>
      </Card>
    </View>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={<View className="flex-1 items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></View>}>
      <ReportsContent />
    </Suspense>
  );
}