import React from 'react';
import { Pressable, ScrollView } from 'react-native';
import { View } from '../ui/view.js';
import { Text } from '../ui/text.js';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

export interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  onPress?: () => void;
  active?: boolean;
}

interface Props {
  items: SidebarItem[];
  collapsed: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

export const Sidebar: React.FC<Props> = ({ items, collapsed, onToggle, children }) => {
  const ViewAny = View as any;
  const TextAny = Text as any;
  const PressableAny = Pressable as any;
  const ScrollViewAny = ScrollView as any;

  return (
    <ViewAny
      className={`h-full bg-zinc-950 border-r border-zinc-800 transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-[280px]'
      }`}
    >
      <ViewAny className="flex-1">
        {/* Toggle Button */}
        <ViewAny className="p-4 items-end">
          <PressableAny 
            onPress={onToggle}
            className="w-8 h-8 items-center justify-center rounded-md bg-zinc-900 border border-zinc-800"
          >
            {collapsed ? (
              <ChevronRight size={16} color="#9ca3af" />
            ) : (
              <ChevronLeft size={16} color="#9ca3af" />
            )}
          </PressableAny>
        </ViewAny>

        <ScrollViewAny className="flex-1 px-3">
          {items.map((item) => (
            <PressableAny
              key={item.id}
              onPress={item.onPress}
              className={`flex-row items-center py-3 px-3 mb-1 rounded-lg transition-colors ${
                item.active ? 'bg-sky-500/10' : 'hover:bg-zinc-900'
              }`}
            >
              <ViewAny className="w-6 items-center justify-center">
                <item.icon size={20} color={item.active ? '#0ea5e9' : '#9ca3af'} />
              </ViewAny>
              
              {!collapsed && (
                <ViewAny className="ml-3 flex-1 animate-in fade-in slide-in-from-left-2 duration-300">
                  <TextAny 
                    className={`text-sm font-medium ${
                      item.active ? 'text-sky-400' : 'text-zinc-400'
                    }`}
                  >
                    {item.label}
                  </TextAny>
                </ViewAny>
              )}
            </PressableAny>
          ))}
          
          {children && <ViewAny className="mt-4 px-1">{children}</ViewAny>}
        </ScrollViewAny>
      </ViewAny>
    </ViewAny>
  );
};
