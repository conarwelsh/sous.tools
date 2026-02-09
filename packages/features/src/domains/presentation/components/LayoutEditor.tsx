"use client";

import React, { useState } from "react";
import { View, Text, Card, Button, Input } from "@sous/ui";
import { 
  Layout, 
  Plus, 
  Trash2, 
  Move, 
  Type, 
  Image as ImageIcon,
  Save,
  ChevronLeft
} from "lucide-react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Slot {
  id: string;
  name: string;
  type: "text" | "image" | "any";
}

const SortableSlot = ({ slot, onDelete }: { slot: Slot; onDelete: (id: string) => void }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slot.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="mb-4">
      <Card className="bg-zinc-900 border-zinc-800 p-4 flex flex-row items-center gap-4 group">
        <div {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-sky-500">
          <Move size={18} />
        </div>
        
        <div className="flex-1">
          <Input 
            value={slot.name} 
            onChange={() => {}} // Handle name change
            className="bg-transparent border-none text-white font-bold p-0 h-auto focus:ring-0" 
          />
          <Text className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Type: {slot.type}
          </Text>
        </div>

        <div className="flex flex-row gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
           <Button variant="ghost" onClick={() => onDelete(slot.id)} className="h-8 w-8 p-0 text-zinc-500 hover:text-destructive">
              <Trash2 size={14} />
           </Button>
        </div>
      </Card>
    </div>
  );
};

export const LayoutEditor = ({ template, onSave, onCancel }: { template?: any; onSave: (data: any) => void; onCancel: () => void }) => {
  const [name, setName] = useState(template?.name || "New Template");
  const [slots, setSlots] = useState<Slot[]>(
    template ? JSON.parse(template.structure).slots : [
      { id: "slot-1", name: "Main Header", type: "text" },
      { id: "slot-2", name: "Body Content", type: "any" }
    ]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setSlots((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addSlot = () => {
    const newId = `slot-${Math.random().toString(36).substring(2, 9)}`;
    setSlots([...slots, { id: newId, name: "New Slot", type: "any" }]);
  };

  const deleteSlot = (id: string) => {
    setSlots(slots.filter(s => s.id !== id));
  };

  const handleSave = () => {
    onSave({
      name,
      structure: JSON.stringify({
        layout: "custom",
        slots
      })
    });
  };

  return (
    <View className="flex-1 bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl flex flex-row h-[700px]">
      {/* Sidebar: Config */}
      <div className="w-80 border-r border-zinc-800 bg-zinc-900/50 p-6 flex flex-col">
        <Button onClick={onCancel} variant="ghost" className="self-start mb-8 -ml-2 text-zinc-500 hover:text-white">
          <ChevronLeft size={16} className="mr-1" />
          <span className="text-[10px] font-black uppercase tracking-widest">Back to Library</span>
        </Button>

        <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest mb-2">
          Template Identity
        </Text>
        <Input 
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Template Name"
          className="mb-8 bg-black border-zinc-800 text-lg font-bold"
        />

        <div className="flex flex-row justify-between items-center mb-4">
          <Text className="text-zinc-500 font-black uppercase text-[10px] tracking-widest">
            Structure / Slots
          </Text>
          <Button onClick={addSlot} className="h-6 w-6 p-0 bg-sky-500 rounded-full">
            <Plus size={12} color="white" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slots.map(s => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {slots.map((slot) => (
                <SortableSlot key={slot.id} slot={slot} onDelete={deleteSlot} />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <Button onClick={handleSave} className="mt-8 bg-sky-500 h-12 shadow-lg shadow-sky-500/20">
          <Save size={18} color="white" className="mr-2" />
          <span className="text-white font-black uppercase tracking-widest text-xs">Save Template</span>
        </Button>
      </div>

      {/* Main Area: Visual Preview */}
      <div className="flex-1 bg-[#050505] p-12 flex flex-col items-center justify-center">
         <div className="w-full max-w-2xl aspect-video bg-zinc-950 border-4 border-zinc-900 rounded-3xl shadow-inner relative p-4 overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-6 gap-2 p-4 opacity-40">
               {slots.map((slot, idx) => (
                 <div 
                   key={slot.id} 
                   className="bg-sky-500/10 border border-sky-500/30 rounded-xl flex items-center justify-center col-span-12 row-span-1"
                 >
                    <Text className="text-[8px] font-black text-sky-500/50 uppercase tracking-widest">
                      {slot.name}
                    </Text>
                 </div>
               ))}
            </div>
            
            {/* Overlay Glass */}
            <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-2xl" />
         </div>
         
         <Text className="mt-8 text-zinc-600 font-bold uppercase text-[10px] tracking-widest">
            Visualizer: Dynamic Structural Preview
         </Text>
      </div>
    </View>
  );
};
