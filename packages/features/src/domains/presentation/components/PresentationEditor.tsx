import React, { useState, useEffect } from "react";
import { Button, Card, Input, View, Text, ScrollView } from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { TemplateStructure, TemplateSlot } from "../types/presentation.types";

interface Template {
  id: string;
  name: string;
  structure: string; // JSON string from DB
}

interface PresentationEditorProps {
  display: any;
  onSave: () => void;
  onCancel: () => void;
}

export const PresentationEditor: React.FC<PresentationEditorProps> = ({
  display,
  onSave,
  onCancel,
}) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [bindings, setBindings] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const http = await getHttpClient();
        if (!(http as any).token && !localStorage.getItem("token")) return;

        const data = await http.get<Template[]>("/presentation/templates");
        setTemplates(data);
      } catch (e) {
        if (e instanceof Error && e.message === "Unauthorized") return;
        console.error("Failed to fetch templates:", e);
      }
    };
    fetchTemplates();
  }, []);

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setStatus("loading");
    try {
      const http = await getHttpClient();
      
      // Map bindings to the format expected by the API
      const content = Object.keys(bindings).reduce((acc, slotId) => {
        acc[slotId] = bindings[slotId].value;
        return acc;
      }, {} as Record<string, string>);

      await http.post("/presentation/assignments", {
        displayId: display.id,
        templateId: selectedTemplate.id,
        content: JSON.stringify(content),
        isActive: true
      });

      setStatus("success");
      setTimeout(() => onSave(), 1000);
    } catch (e) {
      console.error("Failed to save assignment", e);
      setStatus("error");
    }
  };

  const parsedStructure: TemplateStructure | null = selectedTemplate
    ? JSON.parse(selectedTemplate.structure)
    : null;

  return (
    <ScrollView className="flex-1 p-6 bg-background">
      <div className="flex flex-row justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-foreground tracking-tighter uppercase">
          Editing: {display.name}
        </h1>
        <Button onClick={onCancel} className="bg-secondary h-10 px-6 hover:bg-secondary/80">
          <span className="text-secondary-foreground font-black uppercase tracking-widest text-[10px]">Back to list</span>
        </Button>
      </div>

      <div className="flex flex-row gap-6">
        {/* Template List */}
        <div className="flex-1">
          <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-tight mb-4">
            1. Select Template
          </h2>
          <div className="flex flex-col gap-4">
            {templates.map((t) => (
              <button
                key={t.id}
                className="text-left outline-none"
                onClick={() => {
                  setSelectedTemplate(t);
                  setBindings({});
                }}
              >
                <Card
                  className={`p-4 border-2 transition-all ${selectedTemplate?.id === t.id ? "border-primary bg-primary/5" : "border-border bg-card/50 hover:border-muted-foreground/50"}`}
                >
                  <span className="font-bold text-foreground uppercase tracking-tight">
                    {t.name}
                  </span>
                </Card>
              </button>
            ))}
          </div>
        </div>

        {/* Slot Editor */}
        <div className="flex-[2]">
          <h2 className="text-xl font-bold text-muted-foreground uppercase tracking-tight mb-4">
            2. Assign Content
          </h2>
          {parsedStructure ? (
            <Card className="p-6 bg-card border-border shadow-2xl">
              <h3 className="text-lg font-bold text-primary uppercase tracking-widest mb-6">
                {selectedTemplate?.name}
              </h3>
              <div className="flex flex-col gap-6">
                {parsedStructure.slots.map((slot) => (
                  <div key={slot.id} className="flex flex-col">
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-2 ml-1 block">
                      {slot.name} ({slot.type})
                    </label>
                    <Input
                      placeholder={`Enter URL or data for ${slot.type}`}
                      value={bindings[slot.id]?.value || ""}
                      onChange={(e) =>
                        setBindings((prev) => ({
                          ...prev,
                          [slot.id]: { type: slot.type, value: e.target.value },
                        }))
                      }
                      className="bg-background"
                    />
                  </div>
                ))}
              </div>

              <Button
                className="mt-8 h-14 bg-primary text-primary-foreground w-full shadow-lg shadow-primary/20"
                onClick={handleSave}
                disabled={status === "loading"}
              >
                <span className="font-black uppercase tracking-widest">
                  {status === "loading" ? "Saving..." : "Save Presentation"}
                </span>
              </Button>

              {status === "success" && (
                <p className="mt-4 text-emerald-500 font-bold text-center uppercase tracking-widest text-xs">
                  ✅ Saved successfully!
                </p>
              )}
            </Card>
          ) : (
            <div className="p-12 border-2 border-dashed border-border rounded-2xl flex items-center justify-center bg-card/20">
              <p className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                Select a template to begin editing.
              </p>
            </div>
          )}
        </div>
      </div>
    </ScrollView>
  );
};