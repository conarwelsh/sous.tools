"use client";

import React, { useState } from "react";
import { DocumentIngestor, IngestionReviewer, EntityMapper } from "../../ingestion/index";
import { View, Text, Input } from "@sous/ui";
import { FileText, Calendar, User, DollarSign } from "lucide-react";

export function InvoiceIngestionView() {
  const [step, setStep] = useState<"upload" | "review">("upload");
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setIsProcessing(true);
    // Mock processing delay
    setTimeout(() => {
      setIsProcessing(false);
      setStep("review");
    }, 2000);
  };

  if (step === "upload") {
    return (
      <View className="flex-1 items-center justify-center bg-[#0a0a0a] p-8">
        <DocumentIngestor 
          onUpload={handleUpload}
          isLoading={isProcessing}
          title="Invoice Ingestion"
          description="Upload or scan vendor invoices to track price history and update stock."
        />
      </View>
    );
  }

  return (
    <IngestionReviewer
      sourceImage="https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=2070&auto=format&fit=crop"
      title="Review Invoice"
      onSave={() => alert("Committed to ledger")}
      onCancel={() => setStep("upload")}
    >
      {/* Invoice Header */}
      <View className="gap-4">
        <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest border-b border-zinc-800 pb-2">
          General Information
        </Text>
        <View className="flex-row gap-4">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <Calendar size={12} className="text-sky-500" />
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Date</Text>
            </View>
            <Input defaultValue="2026-02-09" className="h-10 bg-black/40 border-zinc-800 text-xs" />
          </View>
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-2">
              <FileText size={12} className="text-sky-500" />
              <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Invoice #</Text>
            </View>
            <Input defaultValue="INV-99201" className="h-10 bg-black/40 border-zinc-800 text-xs" />
          </View>
        </View>
        <View className="gap-2">
          <View className="flex-row items-center gap-2">
            <User size={12} className="text-sky-500" />
            <Text className="text-zinc-400 font-bold uppercase text-[8px] tracking-widest">Vendor</Text>
          </View>
          <Input defaultValue="Sysco Food Services" className="h-10 bg-black/40 border-zinc-800 text-xs" />
        </View>
      </View>

      {/* Line Items */}
      <View className="gap-6">
        <View className="flex-row justify-between items-end border-b border-zinc-800 pb-2">
          <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">
            Line Items
          </Text>
          <Text className="text-sky-500 font-mono text-[10px] uppercase tracking-widest">
            3 Items Detected
          </Text>
        </View>

        <View className="gap-4">
          <EntityMapper 
            originalText="SYSCO RED TOM 5X6 25LB"
            suggestedMatch={{ id: "1", name: "Tomato, Red", confidence: 0.95 }}
            onMatch={(id) => console.log(id)}
          />
          <View className="flex-row gap-4 ml-4 pl-4 border-l-2 border-zinc-800">
             <View className="flex-1 gap-1">
                <Text className="text-zinc-600 font-bold uppercase text-[8px]">Qty</Text>
                <Input defaultValue="1" className="h-8 bg-black/20 border-zinc-800 text-[10px]" />
             </View>
             <View className="flex-1 gap-1">
                <Text className="text-zinc-600 font-bold uppercase text-[8px]">Unit</Text>
                <Input defaultValue="CS" className="h-8 bg-black/20 border-zinc-800 text-[10px]" />
             </View>
             <View className="flex-1 gap-1">
                <Text className="text-zinc-600 font-bold uppercase text-[8px]">Price</Text>
                <Input defaultValue="45.00" className="h-8 bg-black/20 border-zinc-800 text-[10px]" />
             </View>
          </View>

          <EntityMapper 
            originalText="B07X-SALT-KOSHER-3LB"
            suggestedMatch={{ id: "2", name: "Kosher Salt", confidence: 0.82 }}
            onMatch={(id) => console.log(id)}
          />
          <View className="flex-row gap-4 ml-4 pl-4 border-l-2 border-zinc-800">
             <View className="flex-1 gap-1">
                <Text className="text-zinc-600 font-bold uppercase text-[8px]">Qty</Text>
                <Input defaultValue="4" className="h-8 bg-black/20 border-zinc-800 text-[10px]" />
             </View>
             <View className="flex-1 gap-1">
                <Text className="text-zinc-600 font-bold uppercase text-[8px]">Unit</Text>
                <Input defaultValue="EA" className="h-8 bg-black/20 border-zinc-800 text-[10px]" />
             </View>
             <View className="flex-1 gap-1">
                <Text className="text-zinc-600 font-bold uppercase text-[8px]">Price</Text>
                <Input defaultValue="12.50" className="h-8 bg-black/20 border-zinc-800 text-[10px]" />
             </View>
          </View>
        </View>
      </View>

      {/* Totals */}
      <View className="bg-black/40 p-6 rounded-2xl border border-zinc-800">
        <View className="flex-row justify-between mb-2">
          <Text className="text-zinc-500 font-bold uppercase text-[10px]">Subtotal</Text>
          <Text className="text-zinc-300 font-mono text-xs">$95.00</Text>
        </View>
        <View className="flex-row justify-between mb-4">
          <Text className="text-zinc-500 font-bold uppercase text-[10px]">Tax & Fees</Text>
          <Text className="text-zinc-300 font-mono text-xs">$5.00</Text>
        </View>
        <View className="flex-row justify-between border-t border-zinc-800 pt-4">
          <Text className="text-white font-black uppercase text-xs tracking-widest">Total</Text>
          <View className="flex-row items-center gap-1">
            <DollarSign size={14} className="text-sky-500" />
            <Text className="text-sky-500 font-black text-xl tracking-tighter">100.00</Text>
          </View>
        </View>
      </View>
    </IngestionReviewer>
  );
}
