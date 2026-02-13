"use client";

import React from "react";
import { View, Text, cn, Button } from "@sous/ui";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent 
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  rectSortingStrategy,
  useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Star, Flame, Ban, GripVertical } from "lucide-react";

export interface MenuItemListProps {
  items: any[];
  columns?: number;
  showDescription?: boolean;
  showPrice?: boolean;
  isEditMode?: boolean;
  overrides?: Record<string, { featured?: boolean; soldOut?: boolean; hidden?: boolean }>;
  onUpdateOverrides?: (itemId: string, updates: any) => void;
  onUpdateSort?: (itemIds: string[]) => void;
}

function SortableItem({ item, showPrice, showDescription, isEditMode, override, onUpdateOverrides, columns = 2 }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : undefined,
  };

  const isFeatured = override?.featured;
  const isSoldOut = override?.soldOut;

  return (
    <div ref={setNodeRef} style={style} className={cn(
      "relative group/item rounded-2xl transition-all",
      isDragging && "opacity-50 scale-95 shadow-2xl ring-2 ring-sky-500",
      isFeatured && "bg-sky-500/5 ring-1 ring-sky-500/20 p-4 -m-4",
      isSoldOut && "opacity-40 grayscale"
    )}>
      {isEditMode && (
        <div className="absolute -top-3 -left-3 flex flex-row gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-50">
          <Button 
            size="sm" 
            variant="secondary" 
            {...attributes} 
            {...listeners}
            className="h-8 w-8 p-0 rounded-full bg-background border border-border shadow-lg cursor-grab active:cursor-grabbing"
          >
            <GripVertical size={14} className="text-muted-foreground" />
          </Button>
          <Button 
            size="sm" 
            variant={isFeatured ? "default" : "secondary"}
            onClick={() => onUpdateOverrides(item.id, { featured: !isFeatured })}
            className={cn("h-8 w-8 p-0 rounded-full border border-border shadow-lg", isFeatured && "bg-sky-500 hover:bg-sky-400")}
          >
            <Star size={14} className={cn(isFeatured ? "text-white" : "text-muted-foreground")} fill={isFeatured ? "currentColor" : "none"} />
          </Button>
          <Button 
            size="sm" 
            variant={isSoldOut ? "destructive" : "secondary"}
            onClick={() => onUpdateOverrides(item.id, { soldOut: !isSoldOut })}
            className="h-8 w-8 p-0 rounded-full border border-border shadow-lg"
          >
            <Ban size={14} />
          </Button>
        </div>
      )}

      {isFeatured && (
        <div className="flex flex-row items-center gap-1.5 mb-2">
          <Flame size={12} className="text-sky-500 fill-sky-500" />
          <Text className="text-[8px] font-black uppercase tracking-widest text-sky-500">Chef Featured</Text>
        </div>
      )}

      <View className="gap-2">
        <View className="flex-row justify-between items-start gap-4">
          <Text className={cn(
            "font-black text-foreground uppercase tracking-tight leading-none flex-1",
            columns > 3 ? "text-sm" : "text-xl"
          )}>
            {item.name}
          </Text>
          {showPrice && (
            <Text className={cn(
              "font-mono font-bold text-sky-500",
              columns > 3 ? "text-xs" : "text-lg"
            )}>
              ${(item.price / 100).toFixed(2)}
            </Text>
          )}
        </View>
        {showDescription && item.description && (
          <Text className={cn(
            "text-muted-foreground font-medium leading-relaxed max-w-prose",
            columns > 3 ? "text-[10px]" : "text-xs"
          )}>
            {item.description}
          </Text>
        )}
      </View>

      {isSoldOut && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-4 py-1 bg-red-500 rounded-full shadow-lg rotate-[-12deg] border-2 border-white/20">
            <Text className="text-white font-black uppercase text-[10px] tracking-widest">Sold Out</Text>
          </div>
        </div>
      )}
    </div>
  );
}

export function MenuItemList({
  items = [],
  columns = 2,
  showDescription = true,
  showPrice = true,
  isEditMode = false,
  overrides = {},
  onUpdateOverrides,
  onUpdateSort
}: MenuItemListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center p-8 opacity-20 border-2 border-dashed border-border m-4 rounded-3xl">
        <Text className="text-foreground font-black uppercase text-xs tracking-widest">No Items in View</Text>
      </View>
    );
  }

  const gridColsClass = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  }[columns as 1 | 2 | 3 | 4 | 5 | 6] || "grid-cols-2";

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const newOrder = arrayMove(items, oldIndex, newIndex).map(i => i.id);
      onUpdateSort?.(newOrder);
    }
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className={cn("grid gap-x-12 gap-y-12 p-12 w-full", gridColsClass)}>
        <SortableContext 
          items={items.map(i => i.id)} 
          strategy={columns > 1 ? rectSortingStrategy : verticalListSortingStrategy}
        >
          {items.map((item) => (
            <SortableItem 
              key={item.id} 
              item={item} 
              showPrice={showPrice} 
              showDescription={showDescription}
              isEditMode={isEditMode}
              override={overrides[item.id]}
              onUpdateOverrides={onUpdateOverrides}
              columns={columns}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
}
