import React from "react";
import { View, Text } from "@sous/ui";
import {
  TemplateStructure,
  AssignmentContent,
} from "../types/presentation.types";

interface Props {
  structure: TemplateStructure;
  content: AssignmentContent;
}

export const PresentationRenderer: React.FC<Props> = ({
  structure,
  content,
}) => {
  const V = View as any;
  const T = Text as any;
  const renderSlot = (slotId: string) => {
    const binding = content.bindings[slotId];
    const slot = structure.slots.find((s) => s.id === slotId);

    if (!binding) {
      return (
        <V className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-lg p-4 items-center justify-center">
          <T className="text-zinc-600 text-xs uppercase tracking-widest">
            {slot?.name || slotId}
          </T>
        </V>
      );
    }

    switch (binding.type) {
      case "text":
        return <T className="text-white text-2xl font-bold">{binding.value}</T>;
      case "image":
        return (
          <V className="w-full h-full bg-zinc-800 rounded-lg overflow-hidden">
            {/* Image component would go here */}
            <T className="text-zinc-500 m-auto">Image: {binding.value}</T>
          </V>
        );
      default:
        return (
          <T className="text-zinc-400">Unsupported Type: {binding.type}</T>
        );
    }
  };

  if (structure.layout === "fullscreen") {
    return (
      <V className="flex-1 bg-black">{renderSlot(structure.slots[0]?.id)}</V>
    );
  }

  return (
    <V className="flex-1 bg-black p-4">
      <V className="flex-row flex-wrap gap-4">
        {structure.slots.map((slot) => (
          <V key={slot.id} className="flex-1 min-w-[300px] h-[400px]">
            {renderSlot(slot.id)}
          </V>
        ))}
      </V>
    </V>
  );
};
