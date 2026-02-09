"use client";

import React, { useState, useEffect } from "react";
import { Logo, Wordmark, LogoVariant, Environment } from "@sous/ui";
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
  FlaskConical
} from "lucide-react";

export const Atelier: React.FC = () => {
  const [config, setConfig] = useState<BrandingConfig>({});
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant | null>(null);
  const [globalEnvironment, setGlobalEnvironment] = useState<Environment>("production");
  const [globalScale, setGlobalScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Attempt to load standard configuration
    setConfig({
      favicon: { variant: "plate", size: 32, props: { suffix: "tools" } },
      "app-icon": { variant: "neon", size: 512, props: { suffix: "tools", animate: false } },
      "pos-logo": { variant: "pos", size: 48, props: { suffix: "pos" } },
      "kds-logo": { variant: "kds", size: 48, props: { suffix: "kds" } },
      "signage-logo": { variant: "signage", size: 48, props: { suffix: "signage" } },
      "api-logo": { variant: "api", size: 48, props: { suffix: "api" } },
    });
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call to save workspace
    setTimeout(() => {
      setSaving(false);
      navigator.clipboard.writeText(JSON.stringify(config, null, 2));
      alert("Atelier workspace state committed to clipboard. In dev mode, this would write to branding.config.json.");
    }, 800);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background text-sky-500 font-mono">
      <Logo variant="morph" size={64} animate />
      <span className="ml-4 tracking-widest uppercase text-xs font-black">Initialising Atelier...</span>
    </div>
  );

  const variants: LogoVariant[] = [
    "cloud", "api", "morph", "whisk", "hat-and-gear", "kitchen-line", "pos", "kds", "signage", "tools", "neon", "circuit", "line", "plate"
  ];

  const envs: { id: Environment; label: string; icon: any; color: string }[] = [
    { id: "development", label: "Dev", icon: FlaskConical, color: "text-emerald-500 bg-emerald-500/10" },
    { id: "staging", label: "Staging", icon: Shield, color: "text-amber-500 bg-amber-500/10" },
    { id: "production", label: "Prod", icon: Zap, color: "text-sky-500 bg-sky-500/10" },
  ];

  return (
    <div className="flex flex-col h-full bg-background min-h-screen text-muted-foreground font-sans selection:bg-sky-500/30">
      {/* Top Navigation */}
      <nav className="h-16 border-b border-border/50 flex items-center px-8 justify-between sticky top-0 z-[100] bg-background/80 backdrop-blur-2xl">
        <div className="flex items-center space-x-8">
          <Logo variant="cloud" size={24} suffix="atelier" environment={globalEnvironment} />
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
                    isActive ? `${env.color} text-[10px] font-black uppercase tracking-wider` : "text-muted-foreground hover:text-foreground"
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
            <span className="text-[10px] font-mono text-muted-foreground w-8">{Math.round(globalScale * 100)}%</span>
          </div>
          
          <button onClick={handleSave} className="bg-foreground text-background px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-sky-500 hover:text-white transition-all shadow-xl active:scale-95">
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
                selectedVariant === v ? "bg-sky-500/10 text-sky-500 border border-sky-500/20 shadow-lg shadow-sky-500/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Logo variant={v} size={24} showWordmark={false} environment={globalEnvironment} />
              <div className="absolute left-full ml-4 px-2 py-1 bg-card text-foreground text-[8px] font-black uppercase tracking-widest rounded opacity-0 group-hover:opacity-100 pointer-events-none z-50 whitespace-nowrap border border-border shadow-xl">
                {v}
              </div>
            </button>
          ))}
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:32px_32px] p-12">
          <div className="max-w-6xl mx-auto space-y-24">
            
            {/* Stage: Primary Identity */}
            <section className="space-y-8">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-sky-500/10 rounded-lg"><Sparkles size={16} className="text-sky-500" /></div>
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-foreground">Identity Core</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Hero Logo */}
                <div className="bg-card/50 border border-border rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div style={{ transform: `scale(${globalScale})` }} className="transition-transform duration-300">
                    <Logo 
                      variant={selectedVariant || "cloud"} 
                      size={120} 
                      suffix="tools" 
                      environment={globalEnvironment} 
                      animate 
                    />
                  </div>
                  <div className="flex space-x-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-mono px-3 py-1 bg-muted rounded-full border border-border">PRIMARY</span>
                    <span className="text-[10px] font-mono px-3 py-1 bg-muted rounded-full border border-border">VECTOR_READY</span>
                  </div>
                </div>

                {/* Secondary/API Logo */}
                <div className="bg-card/50 border border-border rounded-[2rem] p-12 flex flex-col items-center justify-center space-y-12 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div style={{ transform: `scale(${globalScale})` }} className="transition-transform duration-300">
                    <Logo 
                      variant={selectedVariant || "api"} 
                      size={80} 
                      suffix="api" 
                      environment={globalEnvironment}
                    />
                  </div>
                  <div className="flex space-x-4 opacity-40 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] font-mono px-3 py-1 bg-muted rounded-full border border-border">SECONDARY</span>
                    <span className="text-[10px] font-mono px-3 py-1 bg-muted rounded-full border border-border">TECHNICAL</span>
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
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { id: "pos", label: "Point of Sale", variant: "pos" as LogoVariant },
                  { id: "kds", label: "Kitchen Display", variant: "kds" as LogoVariant },
                  { id: "signage", label: "Digital Signage", variant: "signage" as LogoVariant },
                  { id: "docs", label: "Intelligence Hub", variant: "whisk" as LogoVariant },
                ].map((flavor) => (
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
