import React from "react";
import { Card, Button, cn } from "@sous/ui";
import { Clock, CheckCircle2 } from "lucide-react";

interface Props {
  order: any;
  onBump: (id: string) => void;
}

export const OrderTicket = ({ order, onBump }: Props) => {
  const age = Math.floor(
    (Date.now() - new Date(order.createdAt).getTime()) / 1000 / 60,
  );
  
  const isUrgent = age >= 10;
  const isWarning = age >= 5 && age < 10;

  return (
    <Card
      className={cn(
        "w-[300px] overflow-hidden border-2 flex flex-col rounded-[2rem] transition-all duration-500",
        isUrgent 
          ? "bg-red-500/10 border-red-500/50 shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]" 
          : isWarning 
            ? "bg-amber-500/10 border-amber-500/50 shadow-[0_0_40px_-10px_rgba(245,158,11,0.2)]"
            : "bg-zinc-900/40 border-zinc-800"
      )}
    >
      {/* Ticket Header */}
      <div className={cn(
        "px-6 py-4 flex flex-row justify-between items-center border-b-2 border-dashed",
        isUrgent ? "border-red-500/20 bg-red-500/10" : isWarning ? "border-amber-500/20 bg-amber-500/10" : "border-zinc-800 bg-zinc-900/20"
      )}>
        <div className="flex flex-col">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Order ID</span>
          <span className={cn(
            "text-2xl font-black font-mono tracking-tighter",
            isUrgent ? "text-red-500" : isWarning ? "text-amber-500" : "text-white"
          )}>
            #{order.number}
          </span>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={12} className={isUrgent ? "text-red-500 animate-pulse" : "text-zinc-500"} />
            <span className={cn(
              "text-lg font-black font-mono tracking-tight",
              isUrgent ? "text-red-500" : isWarning ? "text-amber-500" : "text-zinc-400"
            )}>
              {age}m
            </span>
          </div>
          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600">Time Elapsed</span>
        </div>
      </div>

      {/* Ticket Items */}
      <div className="p-6 flex flex-col gap-4 flex-1">
        {order.items.map((item: any, idx: number) => (
          <div key={idx} className="flex flex-row items-start gap-4 group">
            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0">
              <span className="text-primary font-black font-mono text-lg">{item.quantity}</span>
            </div>
            <div className="flex flex-col py-1">
              <span className="text-base font-bold text-white uppercase tracking-tight leading-tight group-hover:text-primary transition-colors">
                {item.name}
              </span>
              {/* Optional: Add item modifiers here */}
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mt-1">Standard Prep</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bump Button */}
      <Button
        className={cn(
          "h-16 rounded-none font-black tracking-[0.3em] uppercase text-xs transition-all italic",
          isUrgent 
            ? "bg-red-500 hover:bg-red-600 text-black shadow-[0_0_30px_rgba(239,68,68,0.4)]" 
            : "bg-primary hover:bg-primary/90 text-black"
        )}
        onClick={() => onBump(order.id)}
      >
        <CheckCircle2 size={18} className="mr-3" />
        Complete Order
      </Button>
    </Card>
  );
};
