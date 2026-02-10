"use client";

import React, { useEffect, useState, use } from "react";
import { LayoutDesigner } from "@sous/features";
import { useRouter } from "next/navigation";
import { getHttpClient } from "@sous/client-sdk";
import { Logo } from "@sous/ui";

export default function EditLayoutPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [template, setTemplate] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const http = await getHttpClient();
        const templates = await http.get<any[]>("/presentation/templates");
        const found = templates.find((t: any) => t.id === id);
        if (found) {
          setTemplate({
            ...found,
            root: typeof found.structure === 'string' 
              ? JSON.parse(found.structure) 
              : found.structure
          });
        }
      } catch (e) {
        console.error("Failed to fetch template", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleSave = async (updatedTemplate: any) => {
    try {
      const http = await getHttpClient();
      const payload = {
        name: updatedTemplate.name,
        structure: JSON.stringify(updatedTemplate.root)
      };
      await http.patch(`/presentation/templates/${id}`, payload);
      router.push("/presentation/layouts");
    } catch (e) {
      console.error("Failed to update template", e);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black">
        <Logo size={48} animate />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black text-white uppercase font-black tracking-widest text-xs">
        Layout not found
      </div>
    );
  }

  return (
    <LayoutDesigner 
      template={template} 
      onSave={handleSave} 
      onCancel={() => router.push("/presentation/layouts")} 
    />
  );
}
