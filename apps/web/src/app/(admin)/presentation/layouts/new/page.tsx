"use client";

import React from "react";
import { LayoutDesigner } from "@sous/features";
import { useRouter } from "next/navigation";
import { getHttpClient } from "@sous/client-sdk";

export default function NewLayoutPage() {
  const router = useRouter();

  const handleSave = async (template: any) => {
    try {
      const http = await getHttpClient();
      const payload = {
        name: template.name,
        structure: JSON.stringify(template.root)
      };
      await http.post("/presentation/templates", payload);
      router.push("/presentation/layouts");
    } catch (e) {
      console.error("Failed to create template", e);
    }
  };

  return (
    <LayoutDesigner 
      onSave={handleSave} 
      onCancel={() => router.push("/presentation/layouts")} 
    />
  );
}
