"use client";

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Card,
  Button,
  Input,
  ScrollView,
  Logo,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@sous/ui";
import { getHttpClient } from "@sous/client-sdk";
import { PresentationEditor } from "./PresentationEditor";
import { Globe, Monitor, Share2, Trash2, Plus } from "lucide-react";

export const KioskManager = () => {
  const [displays, setDisplays] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDisplay, setSelectedDisplay] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchDisplays = async () => {
    setIsLoading(true);
    try {
      const http = await getHttpClient();
      const data = await http.get<any[]>("/presentation/displays");
      setDisplays(data);
    } catch (e) {
      console.error("Failed to fetch displays", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDisplays();
  }, []);

  const handleCreateDisplay = async () => {
    if (!newDisplayName) return;
    setIsCreating(true);
    try {
      const http = await getHttpClient();
      await http.post("/presentation/displays", {
        name: newDisplayName,
        resolution: "1920x1080",
        isActive: true,
        isWebOnly: true,
      });
      setShowAddModal(false);
      setNewDisplayName("");
      await fetchDisplays();
    } catch (e) {
      console.error("Failed to create display", e);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteDisplay = async (id: string) => {
    if (!confirm("Are you sure you want to delete this display?")) return;
    try {
      const http = await getHttpClient();
      await http.delete(`/presentation/displays/${id}`);
      await fetchDisplays();
    } catch (e) {
      console.error("Failed to delete display", e);
    }
  };

  const copyPublicUrl = (displayId: string) => {
    const url = `${window.location.origin}/signage/${displayId}`;
    navigator.clipboard.writeText(url);
    alert("Public URL copied to clipboard!");
  };

  if (selectedDisplay) {
    return (
      <PresentationEditor
        display={selectedDisplay}
        onCancel={() => setSelectedDisplay(null)}
        onSave={() => {
          setSelectedDisplay(null);
          void fetchDisplays();
        }}
      />
    );
  }

  return (
    <ScrollView className="flex-1 p-6 bg-background">
      <div className="flex flex-row justify-between items-end mb-12">
        <View>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase mb-2">
            Screen Assignments
          </h1>
          <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
            Map templates to your physical digital screens or publish as web
            signage.
          </p>
        </View>

        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-primary h-12 px-8"
        >
          <View className="flex-row items-center gap-2">
            <Plus size={16} />
            <span className="text-primary-foreground font-black uppercase tracking-widest text-xs">
              New Assignment
            </span>
          </View>
        </Button>
      </div>

      {isLoading ? (
        <div className="p-20 flex items-center justify-center">
          <Logo size={48} animate />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displays.map((display) => (
            <Card
              key={display.id}
              className="p-6 bg-card border-border border-2 hover:border-primary/50 transition-all group"
            >
              <div className="flex flex-row justify-between items-start mb-6">
                <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center">
                  {display.isWebOnly ? (
                    <Globe size={20} className="text-muted-foreground" />
                  ) : (
                    <Monitor size={20} className="text-muted-foreground" />
                  )}
                </div>
                <div
                  className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${display.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}
                >
                  {display.isWebOnly
                    ? "Public URL"
                    : display.isActive
                      ? "Hardware Paired"
                      : "Awaiting Pairing"}
                </div>
              </div>

              <Text className="text-lg font-black text-foreground uppercase tracking-tight mb-1">
                {display.name}
              </Text>
              <Text className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                {display.resolution || "Auto Resolution"}
              </Text>

              <div className="bg-muted/50 rounded-xl p-4 border border-border mb-6">
                <p className="text-[10px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest mb-2">
                  Current Layout
                </p>
                <p className="text-foreground font-bold uppercase tracking-tight">
                  {display.assignments?.[0]?.template?.name ||
                    "No Template Assigned"}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <Button
                    onClick={() => setSelectedDisplay(display)}
                    className="flex-1 h-10 bg-secondary hover:bg-secondary/80"
                  >
                    <span className="text-secondary-foreground text-[10px] font-black uppercase tracking-widest">
                      Manage Content
                    </span>
                  </Button>
                  <Button
                    onClick={() => copyPublicUrl(display.id)}
                    className="h-10 w-10 bg-secondary hover:bg-secondary/80 flex items-center justify-center border border-border"
                  >
                    <Share2 size={14} className="text-secondary-foreground" />
                  </Button>
                </div>
                <Button
                  onClick={() => handleDeleteDisplay(display.id)}
                  className="h-10 bg-destructive/5 hover:bg-destructive/10 flex items-center justify-center border border-destructive/10 transition-colors"
                >
                  <span className="text-destructive text-[10px] font-black uppercase tracking-widest">
                    Delete Display
                  </span>
                </Button>
              </div>
            </Card>
          ))}

          {displays.length === 0 && (
            <div className="col-span-full p-20 border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center text-center">
              <p className="text-muted-foreground font-black uppercase tracking-widest mb-4">
                No active screens assigned.
              </p>
              <Button
                onClick={() => setShowAddModal(true)}
                className="bg-secondary px-6 h-10"
              >
                <span className="text-secondary-foreground font-black uppercase tracking-widest text-[10px]">
                  Map your first screen
                </span>
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="sm:max-w-[425px] bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground font-black uppercase tracking-tight">
              New Screen Assignment
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                Display Name
              </Text>
              <Input
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                className="bg-muted border-border"
                placeholder="Kitchen Main TV"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleCreateDisplay}
              disabled={isCreating}
              className="bg-primary w-full"
            >
              <Text className="text-primary-foreground font-bold uppercase text-xs tracking-widest">
                {isCreating ? "Creating..." : "Create Display"}
              </Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ScrollView>
  );
};
