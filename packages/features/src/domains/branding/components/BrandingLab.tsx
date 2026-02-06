'use client';

import React, { useState, useEffect } from 'react';
import { Logo, View, LogoVariant, Environment } from '@sous/ui';
import { type BrandingConfig } from '@sous/config';
import { Save, Copy, Layout, Shield, FlaskConical, Zap } from 'lucide-react';

export const BrandingLab: React.FC = () => {
  const [config, setConfig] = useState<BrandingConfig>({});
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant | null>(null);
  const [globalEnvironment, setGlobalEnvironment] = useState<Environment>('production');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setConfig({
      favicon: { variant: 'neon', size: 32, props: {} },
      'app-icon': { variant: 'neon', size: 512, props: { animate: false } },
      'web-banner': { variant: 'neon', size: 64, props: {} },
      'sidebar-logo': { variant: 'neon', size: 24, props: {} }
    });
    setLoading(false);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
        setSaving(false);
        alert('Config copied to clipboard (Simulated Save)');
        navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    }, 500);
  };

  const updateTarget = (target: string, updates: Partial<BrandingConfig[string]>) => {
    setConfig(prev => {
      const current = prev[target] || { variant: 'neon', size: 64, props: {} };
      return {
        ...prev,
        [target]: {
          ...current,
          ...updates,
        }
      };
    });
  };

  const updateProp = (target: string, prop: string, value: any) => {
    const current = config[target] || { variant: 'neon', size: 64, props: {} };
    updateTarget(target, {
      props: {
        ...current.props,
        [prop]: value
      }
    });
  };

  if (loading) return <div className="p-12 text-zinc-500 font-mono">Loading Design Lab...</div>;

  const targets = ['favicon', 'app-icon', 'web-banner', 'sidebar-logo'];
  const variants: LogoVariant[] = ['neon', 'toque-tall', 'beaker', 'hat-and-gear', 'chef-line', 'line'];
  const wordmarkOptions = ['tools', 'api', 'docs', 'kds', 'pos', 'cli', 'headless', 'lab'];

  const envs: { id: Environment; label: string; icon: any; color: string }[] = [
    { id: 'development', label: 'Development', icon: FlaskConical, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'staging', label: 'Staging', icon: Shield, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'production', label: 'Production', icon: Zap, color: 'text-sky-500 bg-sky-500/10' }
  ];

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] min-h-screen text-zinc-300">
      {/* Header */}
      <header className="h-20 border-b border-zinc-800/50 flex items-center px-12 justify-between bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center space-x-6">
          <Logo variant="neon" size={32} suffix="lab" environment={globalEnvironment} />
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigator.clipboard.writeText(JSON.stringify(config, null, 2))}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-all"
          >
            <Copy size={16} />
            <span className="text-xs font-bold uppercase tracking-tighter">Copy JSON</span>
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 rounded-xl bg-sky-500 text-white hover:bg-sky-400 transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)]"
          >
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
            <span className="text-xs font-bold uppercase tracking-tighter">Save Workspace</span>
          </button>
        </div>
      </header>

      {/* Environment Toggler */}
      <div className="px-12 py-6 border-b border-zinc-800/30 bg-zinc-950/30 flex items-center justify-between">
        <div className="flex items-center space-x-2">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mr-4">Global Environment</h2>
            <div className="flex bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
                {envs.map(env => {
                    const Icon = env.icon;
                    const isActive = globalEnvironment === env.id;
                    return (
                        <button
                            key={env.id}
                            onClick={() => setGlobalEnvironment(env.id)}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all ${
                                isActive ? `${env.color} shadow-lg shadow-black/20` : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            <Icon size={14} />
                            <span className="text-xs font-bold uppercase tracking-tighter">{env.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
        <div className="flex items-center space-x-2">
             <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mr-4">Variant Override</h2>
             {selectedVariant ? (
                 <div className="flex items-center bg-sky-500/10 border border-sky-500/20 rounded-xl px-3 py-1 text-sky-500 text-[10px] font-black uppercase tracking-widest">
                    {selectedVariant}
                    <button onClick={() => setSelectedVariant(null)} className="ml-2 hover:text-white">×</button>
                 </div>
             ) : (
                 <span className="text-[10px] font-bold text-zinc-600 uppercase italic">Follows Config</span>
             )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-12">
          {/* Previews Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
            {targets.map(target => {
              const tConfig = config[target] || { variant: 'neon', size: 128, props: {} };
              const previewVariant = selectedVariant || tConfig.variant;
              
              return (
                <div key={target} className="bg-zinc-900/30 border border-zinc-800/50 rounded-3xl p-8 flex flex-col space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">{target}</span>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 rounded bg-zinc-800 text-[10px] font-bold text-zinc-400">{tConfig.size}px</span>
                      <span className="px-2 py-1 rounded bg-zinc-800/50 text-[10px] font-bold text-zinc-500 uppercase">{previewVariant}</span>
                    </div>
                  </div>

                  {/* Actual Size Preview with Canvas */}
                  <div className="h-64 flex items-center justify-center bg-black rounded-2xl border border-zinc-800 relative overflow-hidden group">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                    
                    {/* The "Canvas" */}
                    <div 
                        className="relative border border-dashed border-zinc-700 transition-all group-hover:border-zinc-500"
                        style={{ 
                            width: tConfig.size, 
                            height: tConfig.size,
                            overflow: 'visible' // Allow wordmark to overflow the icon-bound box
                        }}
                    >
                        <div className="absolute inset-0 flex items-center justify-start">
                            <Logo 
                                variant={previewVariant as LogoVariant} 
                                size={tConfig.size} 
                                suffix={tConfig.props?.suffix || 'tools'}
                                showWordmark={tConfig.props?.showWordmark ?? true}
                                environment={globalEnvironment}
                                loading={tConfig.props?.loading ?? false}
                                animate={tConfig.props?.animate ?? false}
                            />
                        </div>
                    </div>
                    
                    {/* Tooltip for scale warning */}
                    {tConfig.size > 256 && (
                        <div className="absolute bottom-4 right-4 text-[8px] font-bold text-zinc-600 uppercase tracking-widest bg-black/50 px-2 py-1 rounded border border-zinc-800">
                            Rendered at 1:1
                        </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase">Size (px)</label>
                      <input 
                        type="number" 
                        value={tConfig.size}
                        onChange={(e) => updateTarget(target, { size: parseInt(e.target.value) })}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/50"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-600 uppercase">Wordmark Suffix</label>
                      <select 
                        value={tConfig.props?.suffix || 'tools'}
                        onChange={(e) => updateProp(target, 'suffix', e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-300 outline-none focus:border-sky-500/50"
                      >
                        {wordmarkOptions.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col space-y-3 pt-2">
                       <label className="flex items-center space-x-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={tConfig.props?.showWordmark ?? true}
                          onChange={(e) => updateProp(target, 'showWordmark', e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-sky-500 focus:ring-0 accent-sky-500"
                        />
                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase transition-colors">Show Wordmark</span>
                      </label>
                       <label className="flex items-center space-x-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={tConfig.props?.animate ?? false}
                          onChange={(e) => updateProp(target, 'animate', e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-sky-500 focus:ring-0 accent-sky-500"
                        />
                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase transition-colors">Animate</span>
                      </label>
                       <label className="flex items-center space-x-2 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={tConfig.props?.loading ?? false}
                          onChange={(e) => updateProp(target, 'loading', e.target.checked)}
                          className="w-4 h-4 rounded border-zinc-800 bg-zinc-950 text-sky-500 focus:ring-0 accent-sky-500"
                        />
                        <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 uppercase transition-colors">Loading State</span>
                      </label>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Variant Gallery */}
          <div className="mb-24">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white mb-6">Variant Gallery</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {variants.map(variant => (
                    <button 
                        key={variant} 
                        onClick={() => setSelectedVariant(variant)}
                        className={`bg-zinc-900/30 border rounded-2xl p-6 flex flex-col items-center gap-6 transition-all group ${
                            selectedVariant === variant 
                                ? 'border-sky-500 bg-sky-500/5' 
                                : 'border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/50'
                        }`}
                    >
                        <Logo variant={variant} size={48} showWordmark={false} environment={globalEnvironment} />
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${
                            selectedVariant === variant ? 'text-sky-500' : 'text-zinc-600 group-hover:text-zinc-400'
                        }`}>
                            {variant}
                        </span>
                    </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
