"use client";

import React from "react";
import { PairingWorkflow } from "./PairingWorkflow";
import { useRouter } from "next/navigation";
import { View, Button } from "@sous/ui";
import { ChevronLeft } from "lucide-react";

export function AddHardwareView() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/settings/hardware");
  };

  return (
    <View className="flex-1 bg-background p-8 items-center justify-center min-h-screen">
      <div className="absolute top-12 left-12">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex flex-row items-center gap-2"
        >
          <ChevronLeft size={20} className="text-muted-foreground" />
          <span className="text-muted-foreground font-bold uppercase text-[10px] tracking-widest hover:text-foreground transition-colors">
            Go Back
          </span>
        </Button>
      </div>

      <PairingWorkflow onSuccess={handleSuccess} />
    </View>
  );
}
