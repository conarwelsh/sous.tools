import React, { useState, useMemo } from "react";
import { View, Text, Button, cn } from "@sous/ui";
import { Utensils, X, Check, Users } from "lucide-react";

interface TableData {
  id: string;
  capacity: number;
  status: 'open' | 'occupied' | 'reserved' | 'dirty';
  amount?: string;
  x: number;
  y: number;
}

const MOCK_TABLES: TableData[] = [
  { id: "A1", capacity: 4, status: "open", x: 0, y: 0 },
  { id: "A2", capacity: 4, status: "reserved", x: 1, y: 0 },
  { id: "A3", capacity: 8, status: "occupied", amount: "$128.50", x: 2, y: 0 },
  { id: "A4", capacity: 4, status: "open", x: 3, y: 0 },
  { id: "A5", capacity: 2, status: "open", x: 0, y: 1 },
  { id: "A6", capacity: 2, status: "occupied", amount: "$45.00", x: 1, y: 1 },
  { id: "A7", capacity: 4, status: "open", x: 2, y: 1 },
  { id: "A8", capacity: 2, status: "open", x: 3, y: 1 },
  { id: "A9", capacity: 6, status: "open", x: 1.5, y: 2 },
  { id: "A10", capacity: 4, status: "dirty", x: 0, y: 3 },
  { id: "A11", capacity: 4, status: "reserved", x: 1, y: 3 },
  { id: "A12", capacity: 4, status: "occupied", amount: "$92.00", x: 2, y: 3 },
  { id: "A14", capacity: 4, status: "reserved", x: 3, y: 3 },
];

export const POSTables = ({ orgId }: { orgId: string }) => {
  const [guestCount, setGuestCount] = useState(2);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);

  const recommendedTableIds = useMemo(() => {
    if (guestCount <= 0) return [];
    
    // Filter available tables that can fit the guests
    const availableFitting = MOCK_TABLES.filter(
      t => t.status === "open" && t.capacity >= guestCount
    );

    if (availableFitting.length === 0) return [];

    // Find the minimum capacity that can fit the guests
    const minCapacity = Math.min(...availableFitting.map(t => t.capacity));
    
    return availableFitting
      .filter(t => t.capacity === minCapacity)
      .map(t => t.id);
  }, [guestCount]);

  const selectedTable = MOCK_TABLES.find(t => t.id === selectedTableId);

  return (
    <View className="flex-1 bg-[#050505] flex flex-col relative">
      <div className="h-20 border-b border-zinc-800 flex items-center justify-between px-8 bg-[#0a0a0a]">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="size-5 text-zinc-400" />
          </button>
          <h2 className="text-xl font-black text-white">
            Select Table
          </h2>
        </div>

        <div className="flex gap-8">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-zinc-500" />
            <span className="text-[10px] text-zinc-500 uppercase font-black">Available : 3</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-blue-500" />
            <span className="text-[10px] text-zinc-500 uppercase font-black">Dine in : 4</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-red-500" />
            <span className="text-[10px] text-zinc-500 uppercase font-black">Reserved : 0</span>
          </div>
        </div>

        <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-xl border border-white/5">
          {["1st Floor", "2nd Floor", "3rd Floor"].map((floor, i) => (
            <button 
              key={floor}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-black transition-all",
                i === 0 ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-500 hover:text-zinc-400"
              )}
            >
              {floor}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-border)_1px,transparent_1px)] [background-size:60px_60px] opacity-10" />
        
        <div className="p-16 grid grid-cols-4 gap-x-24 gap-y-32 relative z-10 max-w-7xl mx-auto">
          {MOCK_TABLES.map((table) => (
            <TableNode 
              key={table.id}
              table={table}
              isSelected={selectedTableId === table.id}
              isRecommended={recommendedTableIds.includes(table.id)}
              onSelect={() => setSelectedTableId(table.id)}
            />
          ))}
        </div>
      </div>

      {/* Guest Selector Dialog - Bottom Centered */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50">
        <div className="bg-[#121212]/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl p-2 flex items-center gap-4 min-w-[400px]">
          <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/50 rounded-xl border border-white/5">
            <div className="bg-amber-500/20 p-2 rounded-lg">
              <Utensils className="size-4 text-amber-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 uppercase font-black leading-none mb-1">Guests</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
                  className="size-6 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  -
                </button>
                <span className="text-lg font-black text-white min-w-[2ch] text-center">{guestCount}</span>
                <button 
                  onClick={() => setGuestCount(guestCount + 1)}
                  className="size-6 flex items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:bg-zinc-700 active:scale-95 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="h-10 w-px bg-white/10" />

          <div className="flex-1 px-2">
            {selectedTable ? (
              <div className="flex items-center gap-3">
                <div className={cn(
                  "size-10 rounded-lg flex items-center justify-center text-white font-black",
                  selectedTable.status === 'open' ? "bg-zinc-700" :
                  selectedTable.status === 'occupied' ? "bg-blue-600" :
                  selectedTable.status === 'reserved' ? "bg-red-600" : "bg-amber-600"
                )}>
                  {selectedTable.id}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white">Table {selectedTable.id}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">{selectedTable.capacity} Seats</span>
                </div>
              </div>
            ) : (
              <span className="text-xs font-bold text-zinc-500 italic">Select a table...</span>
            )}
          </div>

          <Button 
            disabled={!selectedTable || selectedTable.status !== 'open'}
            className={cn(
              "rounded-xl font-black uppercase tracking-widest px-8",
              selectedTable && selectedTable.status === 'open' 
                ? "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]" 
                : "bg-zinc-800 text-zinc-500"
            )}
          >
            Select Table
          </Button>

          {selectedTable && (
            <button 
              onClick={() => setSelectedTableId(null)}
              className="p-2 hover:bg-white/5 rounded-lg text-zinc-500"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>
    </View>
  );
};

const TableNode = ({ table, isSelected, isRecommended, onSelect }: { 
  table: TableData; 
  isSelected: boolean; 
  isRecommended: boolean;
  onSelect: () => void;
}) => {
  const { id, capacity, status, amount } = table;
  
  // Table dimensions based on capacity
  const isLarge = capacity > 4;
  const isSmall = capacity <= 2;
  const width = isLarge ? (capacity > 6 ? 220 : 180) : (isSmall ? 100 : 140);
  const height = 90;

  // Chair positions
  const chairs = [];
  const chairsPerSide = Math.ceil(capacity / 2);
  const chairWidth = 32;
  const chairHeight = 10;
  
  // Calculate spacing to center chairs
  const totalChairWidth = chairsPerSide * chairWidth + (chairsPerSide - 1) * 8;
  const startX = (width - totalChairWidth) / 2;

  for (let i = 0; i < chairsPerSide; i++) {
    const x = startX + i * (chairWidth + 8);
    // Top side
    chairs.push({ x, y: -chairHeight / 2 });
    // Bottom side
    if (i + chairsPerSide < capacity || capacity % 2 === 0) {
      chairs.push({ x, y: height - chairHeight / 2 });
    }
  }

  return (
    <div 
      onClick={onSelect}
      className="relative flex items-center justify-center cursor-pointer group select-none"
      style={{ width, height, margin: '24px auto' }}
    >
      {/* Selection / Recommendation Glow */}
      <div className={cn(
        "absolute inset-0 -m-2 rounded-[2rem] transition-all duration-500",
        isSelected 
          ? "bg-green-500/10 border-2 border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.2)]" 
          : isRecommended
            ? "border border-green-500/30 bg-green-500/5 animate-pulse"
            : "border border-transparent"
      )} />

      {/* Chairs */}
      {chairs.map((pos, i) => (
        <div 
          key={i}
          className="absolute bg-[#2a2a2a] border border-white/5 rounded-full z-0 transition-colors group-hover:bg-[#333]"
          style={{
            left: pos.x,
            top: pos.y,
            width: chairWidth,
            height: chairHeight,
          }}
        />
      ))}

      {/* Table Body */}
      <div className={cn(
        "absolute inset-0 bg-[#141414] border border-white/10 rounded-[2rem] shadow-2xl z-10 transition-all duration-300",
        isSelected ? "scale-105" : "group-hover:scale-[1.02]"
      )}>
        {/* Status Indicator / Badge */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            "size-12 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-300 relative",
            status === 'open' ? "bg-zinc-800" :
            status === 'occupied' ? "bg-blue-600 shadow-blue-500/20" :
            status === 'reserved' ? "bg-red-600 shadow-red-500/20" : "bg-amber-600 shadow-amber-500/20",
            isSelected && "scale-110"
          )}>
            <span className="text-sm font-black text-white">{id}</span>
            {isSelected && (
              <div className="absolute -top-1.5 -right-1.5 size-5 bg-green-500 rounded-full border-2 border-[#141414] flex items-center justify-center shadow-lg">
                <Check className="size-3 text-white stroke-[4]" />
              </div>
            )}
          </div>
        </div>

        {/* Info Overlay */}
        {amount && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
            <span className="text-[10px] font-mono font-black text-blue-400/80">{amount}</span>
          </div>
        )}
      </div>
    </div>
  );
};


// Ensure cn is imported or defined if not already available globally
// import { cn } from "@/lib/utils"; // Example if using a typical shadcn/ui setup
// If cn is not found, it might need to be imported from @sous/ui, or defined locally.
// Assuming it's available in @sous/ui based on previous context.
// The definition below is a fallback if it's not imported correctly.
// function cn(...classes: any[]) {
//   return classes.filter(Boolean).join(" ");
// }
