import React from 'react';
import { View, Text } from '@sous/ui';
import { TemplateStructure, AssignmentContent } from '../types/presentation.types';

interface Props {
  structure: TemplateStructure;
  content: AssignmentContent;
}

export const PresentationRenderer: React.FC<Props> = ({ structure, content }) => {
  const renderSlot = (slotId: string) => {
    const binding = content.bindings[slotId];
    const slot = structure.slots.find(s => s.id === slotId);

    if (!binding) {
      return (
        <View className="bg-zinc-900/50 border border-zinc-800 border-dashed rounded-lg p-4 items-center justify-center">
          <Text className="text-zinc-600 text-xs uppercase tracking-widest">{slot?.name || slotId}</Text>
        </View>
      );
    }

    switch (binding.type) {
      case 'text':
        return <Text className="text-white text-2xl font-bold">{binding.value}</Text>;
      case 'image':
        return (
          <View className="w-full h-full bg-zinc-800 rounded-lg overflow-hidden">
            {/* Image component would go here */}
            <Text className="text-zinc-500 m-auto">Image: {binding.value}</Text>
          </View>
        );
      default:
        return <Text className="text-zinc-400">Unsupported Type: {binding.type}</Text>;
    }
  };

  if (structure.layout === 'fullscreen') {
    return (
      <View className="flex-1 bg-black">
        {renderSlot(structure.slots[0]?.id)}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black p-4">
      <View className="flex-row flex-wrap gap-4">
        {structure.slots.map(slot => (
          <View key={slot.id} className="flex-1 min-w-[300px] h-[400px]">
            {renderSlot(slot.id)}
          </View>
        ))}
      </View>
    </View>
  );
};
