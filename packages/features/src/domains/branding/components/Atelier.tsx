"use client";

import React, { useState, useEffect } from "react";
import { Logo, Wordmark, LogoVariant, Environment, KioskLoading } from "@sous/ui";
import { type BrandingConfig } from "@sous/config";
import {
  Save,
  Copy,
  Monitor,
  Smartphone,
  Watch,
  Globe,
  Maximize2,
  Box,
  Layers,
  Sparkles,
  Zap,
  Shield,
  FlaskConical,
  Grid,
  Layout,
  Play,
  RefreshCcw,
} from "lucide-react";

export const Atelier: React.FC = () => {
  const [config, setConfig] = useState<BrandingConfig>({});
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant | null>(
    null,
  );
  const [globalEnvironment, setGlobalEnvironment] =
    useState<Environment>("production");
  const [globalScale, setGlobalScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Attempt to load standard configuration
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/branding");
        if (res.ok) {
          const data = await res.json();
          setConfig(data);
        } else {
          // Fallback if API not yet implemented
          setConfig({
            "favicon-16": { variant: "plate", size: 16, props: {} },
            "favicon-32": { variant: "plate", size: 32, props: {} },
            "apple-touch-icon": { variant: "neon", size: 180, props: {} },
            "android-chrome-192": { variant: "neon", size: 192, props: {} },
            "android-chrome-512": { variant: "neon", size: 512, props: {} },
            "android-adaptive-foreground": {
              variant: "neon",
              size: 512,
              props: { animate: false }
            },
            "ios-app-icon": {
              variant: "neon",
              size: 1024,
              props: { animate: false }
            },
            "wearos-app-icon": {
              variant: "neon",
              size: 512,
              props: { animate: false }
            },
            "pos-logo": { variant: "pos", size: 512, props: {} },
            "kds-logo": { variant: "kds", size: 512, props: {} },
            "signage-logo": { variant: "signage", size: 512, props: {} },
            "api-logo": { variant: "api", size: 512, props: {} },
            "kiosk-logo": { variant: "kiosk", size: 512, props: {} }
          });
        }
      } catch (e) {
        console.error("Failed to fetch branding config:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleForge = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/branding/forge", { method: "POST" });
      if (response.ok) {
        alert("Assets forged successfully!");
      } else {
        alert("Failed to forge assets.");
      }
    } catch (e) {
      alert("Forge failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/branding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        alert("Configuration saved to workspace (branding.config.json)");
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.error}`);
        // Fallback to clipboard
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      }
    } catch (e) {
      console.error("Save error:", e);
      navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      alert("Atelier workspace state committed to clipboard (Local API unavailable).");
    } finally {
      setSaving(false);
    }
  };

  const handlePasteConfig = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const pasted = JSON.parse(e.target.value);
      setConfig(pasted);
    } catch (e) {}
  };

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background text-sky-500 font-mono">
        <Logo variant="morph" size={64} animate />
        <span className="ml-4 tracking-widest uppercase text-xs font-black">
          Initialising Atelier...
        </span>
      </div>
    );

  const variants: LogoVariant[] = [
    "cloud",
    "api",
    "morph",
    "whisk",
    "hat-and-gear",
    "kitchen-line",
    "pos",
    "kds",
    "signage",
    "kiosk",
    "tools",
    "neon",
    "circuit",
    "line",
    "plate",
  ];

  const envs: { id: Environment; label: string; icon: any; color: string }[] = [
    {
      id: "development",
      label: "Dev",
      icon: FlaskConical,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      id: "staging",
      label: "Staging",
      icon: Shield,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      id: "production",
      label: "Prod",
      icon: Zap,
      color: "text-sky-500 bg-sky-500/10",
    },
  ];

  return (
    <div className="flex flex-col h-full bg-background min-h-screen text-muted-foreground font-sans selection:bg-sky-500/30">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-border/50 flex items-center px-8 justify-between sticky top-0 z-[100] bg-background/80 backdrop-blur-2xl">
        <div className="flex items-center space-x-8">
          <Logo
            variant="cloud"
            size={24}
            suffix="atelier"
            environment={globalEnvironment}
          />
          <div className="h-4 w-[1px] bg-border" />
          <div className="flex space-x-1 bg-muted p-1 rounded-full border border-border">
            {envs.map((env) => {
              const Icon = env.icon;
              const isActive = globalEnvironment === env.id;
              return (
                <button
                  key={env.id}
                  onClick={() => setGlobalEnvironment(env.id)}
                  className={`flex items-center space-x-2 px-4 py-1.5 rounded-full transition-all ${
                    isActive
                      ? `${env.color} text-[10px] font-black uppercase tracking-wider`
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon size={12} />
                  {isActive && <span>{env.label}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 bg-muted px-4 py-1.5 rounded-full border border-border">
            <Maximize2 size={12} className="text-muted-foreground" />
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={globalScale}
              onChange={(e) => setGlobalScale(parseFloat(e.target.value))}
              className="w-24 accent-sky-500"
            />
            <span className="text-[10px] font-mono text-muted-foreground w-8">
              {Math.round(globalScale * 100)}%
            </span>
          </div>

          <button
            onClick={handleForge}
            className="border border-sky-500/50 text-sky-500 px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white transition-all active:scale-95"
          >
            Forge Assets
          </button>
          <button
            onClick={handleSave}
            className="bg-foreground text-background px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white transition-all shadow-xl active:scale-95"
          >
            {saving ? "Saving..." : "Commit Changes"}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Variants */}
        <aside className="w-20 border-r border-border/50 flex flex-col items-center py-8 space-y-6 bg-muted/20">
          <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-2 [writing-mode:vertical-lr] rotate-180">
            Components
          </div>
          {variants.map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVariant(v)}
              className={`p-3 rounded-2xl transition-all group relative ${
                selectedVariant === v
                  ? "bg-sky-500/10 text-sky-500 border border-sky-500/20 shadow-lg shadow-sky-500/10"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Logo
                variant={v}
                size={24}
                showWordmark={false}
                environment={globalEnvironment}
              />
              <div className="absolute left-full ml-4 px-2 py-1 bg-card text-foreground text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap border border-border shadow-xl">
                {v}
              </div>
            </button>
          ))}
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:32px_32px] p-12">
          <div className="max-w-6xl mx-auto space-y-24 pb-32">
            
            {/* Stage: Vector & Mask Validation */}
            <section className="space-y-8">
              <div className="flex flex-row items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-sky-500/10 rounded-lg"><Grid size={16} className="text-sky-500" /></div>
                  <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Active Manifest Validation</h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {Object.entries(config).map(([key, cfg]: [string, any]) => {
                  let mask: "squircle" | "rounded" | "circle" | "none" = "none";
                  if (key.includes("android-adaptive")) mask = "squircle";
                  else if (key.includes("ios-app-icon")) mask = "rounded";
                  else if (key.includes("wearos-app-icon")) mask = "circle";
                  else if (key.includes("apple-touch")) mask = "rounded";

                  return (
                    <IconPreviewCard 
                      key={key}
                      label={key} 
                      type={cfg.variant.toUpperCase()} 
                      color="text-sky-500" 
                      mask={mask} 
                      variant={cfg.variant} 
                      env={globalEnvironment}
                      size={cfg.size}
                    />
                  );
                })}
              </div>

              {/* Density Grid */}
              <div className="bg-card/30 border border-border/50 rounded-[2rem] p-8 flex flex-row items-center justify-between">
                 {[16, 24, 32, 48, 64, 128].map(size => (
                   <div key={size} className="flex flex-col items-center gap-3">
                      <Logo 
                        variant={selectedVariant || "cloud"} 
                        size={size} 
                        showWordmark={false} 
                        environment={globalEnvironment}
                      />
                      <span className="text-[8px] font-mono font-bold text-muted-foreground uppercase">{size}px</span>
                   </div>
                 ))}
              </div>
            </section>

            {/* Stage: UI Contexts */}
            <section className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-purple-500/10 rounded-lg"><Layout size={16} className="text-purple-500" /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">UI Contextual Scale</h2>
              </div>

              <div className="grid grid-cols-3 gap-8">
                {/* Sidebar Context */}
                <div className="bg-card/50 border border-border rounded-3xl p-8 flex flex-col gap-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sidebar (Collapsed)</span>
                  <div className="w-16 h-64 bg-zinc-950 rounded-2xl border border-zinc-800 flex flex-col items-center py-6">
                    <Logo variant={selectedVariant || "cloud"} size={28} showWordmark={false} environment={globalEnvironment} />
                    <div className="mt-8 flex flex-col gap-4 opacity-20">
                      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="w-8 h-8 rounded-lg bg-zinc-800" />)}
                    </div>
                  </div>
                </div>

                {/* Footer Context */}
                <div className="bg-card/50 border border-border rounded-3xl p-8 flex flex-col gap-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Footer / Status Bar</span>
                  <div className="w-full h-12 bg-zinc-950 rounded-xl border border-zinc-800 mt-auto flex items-center px-4 justify-between">
                    <Logo variant={selectedVariant || "cloud"} size={16} showWordmark={false} environment={globalEnvironment} />
                    <div className="flex gap-2">
                      <div className="w-12 h-2 rounded bg-zinc-800 opacity-20" />
                      <div className="w-12 h-2 rounded bg-zinc-800 opacity-20" />
                    </div>
                  </div>
                </div>

                {/* Navbar Context */}
                <div className="bg-card/50 border border-border rounded-3xl p-8 flex flex-col gap-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Navigation Header</span>
                  <div className="w-full h-16 bg-zinc-900 rounded-xl border border-zinc-800 flex items-center px-6 gap-4">
                    <Logo variant={selectedVariant || "cloud"} size={32} showWordmark environment={globalEnvironment} />
                  </div>
                </div>
              </div>
            </section>

            {/* Stage: Loading & Splash */}
            <section className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg"><Play size={16} className="text-emerald-500" /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Launch Experience</h2>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Initializing Hardware */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8">Hardware Initialization</span>
                  <div className="w-full aspect-video bg-black rounded-3xl border border-zinc-800 flex items-center justify-center relative overflow-hidden">
                    <div className="flex flex-col items-center gap-6">
                      <Logo variant={selectedVariant || "cloud"} size={64} animate environment={globalEnvironment} />
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCcw size={24} className="text-zinc-800 animate-spin" />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-600">Initializing Core...</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Kiosk Loading */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8">Service Splash</span>
                  <div className="w-full aspect-video bg-zinc-950 rounded-3xl border border-zinc-800 overflow-hidden relative">
                    <KioskLoading suffix={selectedVariant === 'pos' ? 'pos' : 'kiosk'} />
                  </div>
                </div>
              </div>
            </section>

            {/* Stage: Product Flavors */}
            <section className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-muted rounded-lg"><Layers size={16} className="text-muted-foreground" /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">System Flavors</h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                {[
                  { id: "pos", label: "Point of Sale", variant: "pos" as LogoVariant },
                  { id: "kds", label: "Kitchen Display", variant: "kds" as LogoVariant },
                  { id: "signage", label: "Digital Signage", variant: "signage" as LogoVariant },
                  { id: "kiosk", label: "Self-Order Kiosk", variant: "kiosk" as LogoVariant },
                  { id: "docs", label: "Intelligence Hub", variant: "whisk" as LogoVariant },
                ].map(flavor => (
                  <div key={flavor.id} className="bg-card/30 border border-border/50 rounded-3xl p-8 flex flex-col items-center space-y-6 hover:border-border transition-all group">
                    <Logo variant={flavor.variant} size={48} showWordmark={false} environment={globalEnvironment} />
                    <div className="text-center">
                      <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">{flavor.id}</div>
                      <Wordmark size={16} suffix={flavor.id} environment={globalEnvironment} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Stage: Deployment Preview */}
            <section className="space-y-8 pb-24">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-amber-500/10 rounded-lg"><Box size={16} className="text-amber-500" /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Deployment Preview</h2>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Mobile Preview */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center shadow-xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center">
                    <Smartphone size={12} className="mr-2" /> Android / iOS
                  </div>
                  <div className="w-48 h-96 bg-muted rounded-[2rem] border-4 border-muted-foreground/20 p-4 flex flex-col">
                    <div className="w-12 h-1 bg-muted-foreground/20 rounded-full mx-auto mb-8" />
                    <div className="grid grid-cols-4 gap-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className={`aspect-square rounded-xl flex items-center justify-center ${i === 0 ? "bg-card shadow-xl border border-border" : "bg-card/20"}`}>
                          {i === 0 && <Logo variant="cloud" size={24} showWordmark={false} environment={globalEnvironment} />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Web Preview */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center shadow-xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center">
                    <Globe size={12} className="mr-2" /> Browser / PWA
                  </div>
                  <div className="w-full h-48 bg-muted rounded-xl border border-border overflow-hidden flex flex-col">
                    <div className="h-6 bg-muted-foreground/10 flex items-center px-3 space-x-1 border-b border-border/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500/50" />
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/50" />
                      <div className="ml-4 h-4 w-32 bg-card rounded flex items-center px-2 border border-border/50">
                        <Logo variant="cloud" size={10} showWordmark={false} environment={globalEnvironment} />
                        <span className="text-[6px] text-muted-foreground ml-1">sous.tools</span>
                      </div>
                    </div>
                    <div className="flex-1 p-4 bg-card/50">
                      <div className="h-2 w-24 bg-muted rounded mb-2" />
                      <div className="h-2 w-full bg-muted/50 rounded mb-1" />
                      <div className="h-2 w-full bg-muted/50 rounded mb-1" />
                      <div className="h-2 w-2/3 bg-muted/50 rounded" />
                    </div>
                  </div>
                </div>

                {/* Watch Preview */}
                <div className="bg-card border border-border rounded-[2.5rem] p-8 flex flex-col items-center shadow-xl">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-8 flex items-center">
                    <Watch size={12} className="mr-2" /> Wear OS
                  </div>
                  <div className="w-40 h-40 bg-muted rounded-full border-4 border-muted-foreground/20 flex items-center justify-center relative shadow-inner">
                    <div className="text-center">
                      <Logo variant="cloud" size={32} showWordmark={false} environment={globalEnvironment} animate />
                      <div className="text-[8px] font-mono text-sky-500 mt-2">12:45</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

const IconPreviewCard = ({ label, type, color, mask, variant, env }: any) => (
  <div className="bg-card/50 border border-border rounded-[2rem] p-6 flex flex-col gap-4">
    <div className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex justify-between px-2">
      <span>{label}</span>
      <span className={color}>{type}</span>
    </div>
    <div className="aspect-square bg-muted/20 rounded-2xl flex items-center justify-center border border-border/50 relative overflow-hidden">
      {mask === 'squircle' && <div className="absolute inset-0 border-[1px] border-emerald-500/20 rounded-[35%] pointer-events-none" />}
      <div className={cn(
        "w-[120px] h-[120px] bg-background flex items-center justify-center overflow-hidden border border-border shadow-xl",
        mask === 'squircle' ? "rounded-[35%]" : mask === 'rounded' ? "rounded-[22%]" : mask === 'circle' ? "rounded-full" : "rounded-none"
      )}>
        <Logo
          variant={variant || "cloud"}
          size={mask === 'circle' ? 64 : 80}
          showWordmark={false}
          environment={env}
        />
      </div>
    </div>
  </div>
);

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
