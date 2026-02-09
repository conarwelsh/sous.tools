"use client";

import React, { useState } from "react";
import { Button, Card, Input } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";

export const PairingWorkflow = ({ onSuccess }: { onSuccess?: () => void }) => {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handlePair = async () => {
    if (code.length !== 6) return;

    setStatus("loading");
    try {
      const http = await getHttpClient();
      await http.post("/hardware/pair", { code });
      setStatus("success");
      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (e) {
      console.error("Pairing failed:", e);
      setStatus("error");
    }
  };

  return (
    <Card className="p-8 max-w-md mx-auto bg-card border-border shadow-2xl flex flex-col items-center">
      <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">
        Pair New Device
      </h2>
      <p className="text-muted-foreground mb-8 text-center text-sm font-medium">
        Enter the 6-digit code displayed on your device screen.
      </p>

      <Input
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        placeholder="ABC123"
        maxLength={6}
        className="h-20 rounded-2xl text-4xl text-center font-mono mb-8 bg-background border-border focus:ring-primary/50"
      />

      <Button
        onClick={handlePair}
        disabled={status === "loading"}
        className="h-14 w-full bg-sky-500 shadow-lg shadow-sky-500/20"
      >
        <span className="text-white font-black uppercase tracking-widest">
          {status === "loading" ? "Pairing..." : "Pair Device"}
        </span>
      </Button>

      {status === "success" && (
        <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl w-full">
          <p className="text-emerald-500 text-center font-bold uppercase tracking-widest text-xs">
            ✅ Device paired successfully!
          </p>
        </div>
      )}
      {status === "error" && (
        <div className="mt-6 p-4 bg-destructive/10 border border-destructive/20 rounded-xl w-full">
          <p className="text-destructive text-center font-bold uppercase tracking-widest text-xs">
            ❌ Invalid or expired code.
          </p>
        </div>
      )}
    </Card>
  );
};
