import * as React from 'react';
import { View, Modal, Pressable } from 'react-native';
import { cn } from '../../lib/utils.js';
import { X } from 'lucide-react-native';
import { Typography } from './typography.js';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  children,
  className 
}) => {
  const ViewAny = View as any;
  const PressableAny = Pressable as any;

  return (
    <Modal
      transparent
      visible={open}
      onRequestClose={() => onOpenChange(false)}
      animationType="fade"
    >
      <PressableAny 
        className="flex-1 bg-black/60 backdrop-blur-sm items-center justify-center p-4"
        onPress={() => onOpenChange(false)}
      >
        <PressableAny 
          onPress={(e: any) => e.stopPropagation()}
          className={cn(
            "w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200",
            className
          )}
        >
          {/* Header */}
          <ViewAny className="p-6 border-b border-zinc-900 flex-row items-start justify-between">
            <ViewAny className="space-y-1 flex-1">
              {title && <Typography variant="h3">{title}</Typography>}
              {description && <Typography variant="muted">{description}</Typography>}
            </ViewAny>
            <PressableAny 
              onPress={() => onOpenChange(false)}
              className="p-2 rounded-xl hover:bg-zinc-900 transition-colors"
            >
              <X size={20} color="#71717a" />
            </PressableAny>
          </ViewAny>

          {/* Content */}
          <ViewAny className="p-6">
            {children}
          </ViewAny>
        </PressableAny>
      </PressableAny>
    </Modal>
  );
};
