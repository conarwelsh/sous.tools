"use client";

import React from "react";
import { LayoutDesigner } from "@sous/features";
import { useRouter } from "next/navigation";
import { getHttpClient } from "@sous/client-sdk";

export default function NewLayoutPage() {
  const router = useRouter();

  const handleSave = async (layout: any) => {
    try {
      const http = await getHttpClient();
      const payload = {
        name: layout.name,
        type: layout.type || "TEMPLATE",
        structure: JSON.stringify(layout.structure),
        content: JSON.stringify(layout.content || {}),
        config: JSON.stringify(layout.config || {}),
      };
      await http.post("/presentation/layouts", payload);
      router.push("/presentation/layouts");
    } catch (e) {
      console.error("Failed to create layout", e);
    }
  };

  return (
    <LayoutDesigner
      onSave={handleSave}
      onCancel={() => router.push("/presentation/layouts")}
    />
  );
}
