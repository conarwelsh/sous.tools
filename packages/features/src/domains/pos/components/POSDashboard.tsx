import React from "react";
import { View, Text, Card, cn } from "@sous/ui";
import { DollarSign, FileText, Utensils, TrendingUp, Activity } from "lucide-react";

export const POSDashboard = ({ orgId }: { orgId: string }) => {
  return (
    <View className="flex-1 p-10 bg-[#050505] overflow-y-auto relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:40px_40px] opacity-5 pointer-events-none" />
      
      <div className="flex items-center justify-between mb-12 relative z-10">
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-zinc-500 leading-none mb-2">Operational Analytics</span>
          <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">
            Shift <span className="text-sky-500 drop-shadow-[0_0_15px_rgba(14,165,233,0.4)]">Dashboard</span>
          </h1>
        </div>
        <div className="px-6 py-3 bg-white/5 backdrop-blur-xl rounded-[1.5rem] border border-white/5 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
          <Text className="text-white font-mono font-bold text-xs tracking-widest uppercase">
            {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12 relative z-10">
        <MetricCard 
          label="Net Sales" 
          value="$1,245.50" 
          icon={DollarSign} 
          color="text-sky-400" 
          glow="shadow-[0_0_40px_-5px_rgba(14,165,233,0.3)] border-sky-500/30"
          bg="bg-sky-500/5"
        />
        <MetricCard 
          label="Open Tickets" 
          value="08" 
          icon={FileText} 
          color="text-amber-400" 
          glow="shadow-[0_0_40px_-5px_rgba(245,158,11,0.2)] border-amber-500/20"
          bg="bg-amber-500/5"
        />
        <MetricCard 
          label="Live Covers" 
          value="32" 
          icon={Utensils} 
          color="text-emerald-400" 
          glow="shadow-[0_0_40px_-5px_rgba(16,185,129,0.2)] border-emerald-500/20"
          bg="bg-emerald-500/5"
        />
        <MetricCard 
          label="Avg. Ticket" 
          value="$42.10" 
          icon={TrendingUp} 
          color="text-purple-400" 
          glow="shadow-[0_0_40px_-5px_rgba(168,85,247,0.2)] border-purple-500/20"
          bg="bg-purple-500/5"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10 relative z-10">
        <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/5 p-8 rounded-[3rem] h-[500px] flex flex-col shadow-2xl group hover:border-white/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Activity size={18} className="text-sky-400" />
              </div>
              <h3 className="font-black uppercase tracking-[0.2em] text-white text-xs">Recent Velocity</h3>
            </div>
            <button className="text-[10px] font-black uppercase text-zinc-500 hover:text-white transition-colors">View All</button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-white/5 border border-white/5 rounded-[2rem] group/item hover:bg-white/10 hover:border-white/10 transition-all duration-500">
                <div className="flex gap-5 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center text-sky-400 font-black text-sm border border-white/5">#{40+i}</div>
                  <div>
                    <div className="text-white font-black text-sm uppercase tracking-tight italic">Table {i*2}</div>
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">Processed {i*5}m ago</div>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-white font-mono font-black text-lg">${(120.50 + i*15).toFixed(2)}</div>
                  <div className="text-emerald-500 text-[9px] font-black uppercase tracking-[0.2em] bg-emerald-500/10 px-2 py-0.5 rounded-full mt-1 border border-emerald-500/20">Verified</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-zinc-950/40 backdrop-blur-xl border-white/5 p-8 rounded-[3rem] h-[500px] flex flex-col shadow-2xl group hover:border-white/10 transition-all duration-500">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5">
                <Utensils size={18} className="text-sky-400" />
              </div>
              <h3 className="font-black uppercase tracking-[0.2em] text-white text-xs">Inventory Alerts</h3>
            </div>
            <span className="text-[10px] font-black uppercase text-zinc-500 bg-black/40 px-4 py-1.5 rounded-full border border-white/5 shadow-inner italic">3 Inactive Items</span>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto pr-2 no-scrollbar">
            {[
              { name: "Prime Ribeye 12oz", category: "Signature Entrees", stock: 0 },
              { name: "Wild Caught Salmon", category: "Signature Entrees", stock: 0 },
              { name: "Artisanal Sourdough", category: "House Bakery", stock: 0 },
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-red-500/5 border border-red-500/10 rounded-[2rem] group/item hover:bg-red-500/10 transition-all duration-500">
                <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 font-black text-sm border border-red-500/20">!</div>
                  <div>
                    <div className="text-white font-black text-sm uppercase tracking-tight italic">{item.name}</div>
                    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">{item.category}</div>
                  </div>
                </div>
                <button className="h-10 px-5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all">Resolve</button>
              </div>
            ))}
          </div>
          <button className="mt-8 w-full h-16 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-sky-400 hover:bg-sky-500/5 hover:border-sky-500/20 transition-all duration-500 italic">
            Initialize Stock Audit
          </button>
        </Card>
      </div>
    </View>
  );
};

const MetricCard = ({ label, value, icon: Icon, color, glow, bg }: any) => (
  <div className={cn(
    "border p-8 rounded-[2.5rem] flex flex-col justify-between h-48 relative overflow-hidden group transition-all duration-700 backdrop-blur-md cursor-default",
    glow, bg
  )}>
    {/* Animated Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
    
    <div className="flex justify-between items-start z-10 relative">
      <div className={cn("p-4 rounded-2xl bg-black/40 border border-white/5 transition-all duration-500 group-hover:scale-110", color)}>
        <Icon size={22} className="drop-shadow-[0_0_8px_currentColor]" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 group-hover:text-zinc-300 transition-colors duration-500">{label}</span>
    </div>
    
    <div className={cn("text-5xl font-black tracking-tighter z-10 relative italic drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]", color)}>
      {value}
    </div>
    
    {/* Decorative blur */}
    <div className={cn("absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[60px] opacity-20 transition-all duration-700 group-hover:opacity-40 group-hover:scale-125", bg.replace('bg-', 'bg-').replace('/5', ''))} />
  </div>
);

