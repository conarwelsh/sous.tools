"use client";

import React from "react";
import { View, Text, Button, Card, Logo, GoogleDriveLogo, SquareLogo } from "@sous/ui";
import { Link, Plus, Store, HardDrive } from "lucide-react";

export default function ConnectorsPage() {
  const connectors = [
    { 
      id: "square", 
      name: "Square", 
      description: "Sync sales, catalog, and inventory.", 
      icon: SquareLogo,
      color: "text-[#ffffff]",
      bg: "bg-black"
    },
    { 
      id: "google-drive", 
      name: "Google Drive", 
      description: "Auto-sync recipe PDFs and images.", 
      icon: GoogleDriveLogo,
      color: "",
      bg: "bg-white"
    }
  ];

  return (
    <View className="flex-1 bg-[#0a0a0a] p-8">
      <View className="flex-row justify-between items-end mb-12">
        <View>
          <Text className="text-zinc-500 font-bold uppercase text-xs tracking-widest mb-2">
            Integrations / Ecosystem
          </Text>
          <h1 className="text-4xl font-black text-white uppercase tracking-tighter">
            Connectors
          </h1>
        </View>
      </View>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {connectors.map((c) => {
          const Icon = c.icon;
          return (
            <Card key={c.id} className="p-8 bg-zinc-900 border-zinc-800 border-2 hover:border-zinc-700 transition-all flex flex-col">
              <div className={`h-14 w-14 rounded-2xl ${c.bg} border border-zinc-800 flex items-center justify-center mb-6 shadow-2xl`}>
                <Icon size={24} className={c.color} />
              </div>
              
              <Text className="text-xl font-black text-white uppercase tracking-tight mb-2">
                {c.name}
              </Text>
              <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-8 leading-relaxed">
                {c.description}
              </Text>

              <Button className="mt-auto h-12 bg-zinc-800 hover:bg-sky-500 transition-colors group">
                <span className="text-white font-black uppercase tracking-widest text-[10px]">
                  Connect {c.name}
                </span>
              </Button>
            </Card>
          );
        })}

        <Card className="p-8 bg-zinc-900/30 border-zinc-800 border-2 border-dashed items-center justify-center flex flex-col opacity-50 grayscale">
           <Plus size={32} className="text-zinc-800 mb-2" />
           <Text className="text-zinc-700 font-black uppercase text-[10px] tracking-widest">
              More Coming Soon
           </Text>
        </Card>
      </div>
    </View>
  );
}