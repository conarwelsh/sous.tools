import React from 'react';
import { Pressable } from 'react-native';
import { View } from '../ui/view.js';

interface Props {
  active: boolean;
  onPress: () => void;
  color?: string;
}

export const Hamburger: React.FC<Props> = ({ active, onPress, color = '#0ea5e9' }) => {
  const ViewAny = View as any;
  const PressableAny = Pressable as any;

  return (
    <PressableAny onPress={onPress} className="w-10 h-10 items-center justify-center">
      <ViewAny className="w-6 h-5 justify-between">
        <ViewAny 
          style={{ backgroundColor: color }}
          className={`h-0.5 w-full rounded-full transition-transform duration-300 ${
            active ? 'translate-y-[9px] rotate-45' : ''
          }`} 
        />
        <ViewAny 
          style={{ backgroundColor: color }}
          className={`h-0.5 w-full rounded-full transition-opacity duration-300 ${
            active ? 'opacity-0 -translate-x-2' : ''
          }`} 
        />
        <ViewAny 
          style={{ backgroundColor: color }}
          className={`h-0.5 w-full rounded-full transition-transform duration-300 ${
            active ? '-translate-y-[9px] -rotate-45' : ''
          }`} 
        />
      </ViewAny>
    </PressableAny>
  );
};
