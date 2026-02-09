"use client";

import React, { useState } from "react";
import { Button, Card, View, Text } from "@sous/ui";

export const LabelEditor = () => {
  const [content, setContent] = useState(
    "Item: Prep\nDate: 2026-02-06\nExp: 2026-02-09",
  );

  const handlePrint = async () => {
    // Note: In Capacitor/Web we use a different approach for printing.
    console.log("Printing label:", content);
  };

  return (
    <Card className="p-6 max-w-md bg-zinc-900 border-zinc-800 shadow-2xl">
      <h2 className="text-xl font-bold text-white uppercase tracking-tight mb-4">
        Label Printer
      </h2>
      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full bg-black/50 p-4 mb-4 font-mono border border-zinc-800 rounded-xl text-zinc-300 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
      />
      <Button
        onClick={handlePrint}
        className="h-12 w-full bg-primary hover:bg-primary/90"
      >
        <span className="text-primary-foreground font-bold uppercase tracking-widest">
          Print Label
        </span>
      </Button>
    </Card>
  );
};
